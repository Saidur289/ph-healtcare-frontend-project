// @vitest-environment node
// plan.md 11.11: the proxy for every role on every route group, with valid, expired,
// missing and invalid tokens (the API refresh call is faked with a mocked fetch).
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { getRedirectUrl } from "next/experimental/testing/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

const SECRET = process.env.ACCESS_TOKEN_SECRET!;
const ORIGIN = "http://localhost:3000";
type TRole = "PATIENT" | "DOCTOR" | "ADMIN" | "SUPER_ADMIN";

const accessToken = (role: TRole, options: { expiresIn?: number; needPasswordChange?: boolean; secret?: string } = {}) =>
  jwt.sign(
    { userId: `user-${role}`, role, needPasswordChange: options.needPasswordChange ?? false, sid: "session-1" },
    options.secret ?? SECRET,
    { expiresIn: options.expiresIn ?? 15 * 60 },
  );

const request = (path: string, cookies: Record<string, string> = {}) =>
  new NextRequest(new URL(path, ORIGIN), {
    headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ") },
  });

const loggedIn = (role: TRole, token = accessToken(role)) => ({
  accessToken: token,
  refreshToken: "refresh-token",
  "better-auth.session_token": "session-token",
});

// "next" = the page renders; otherwise the redirect path (+ query)
const outcome = async (req: NextRequest) => {
  const res = await proxy(req);
  const location = getRedirectUrl(res);
  if (!location) return { res, to: "next" };
  const url = new URL(location);
  return { res, to: `${url.pathname}${url.search}` };
};

const setCookies = (res: Response) => res.headers.getSetCookie().join("\n");

afterEach(() => vi.unstubAllGlobals());

const PAGES = {
  public: "/consultation",
  login: "/login",
  patient: "/dashboard/my-appointments",
  doctor: "/doctor/dashboard/appointments",
  admin: "/admin/dashboard/doctors",
  common: "/my-profile",
};
const DASHBOARD: Record<TRole, string> = {
  PATIENT: "/dashboard",
  DOCTOR: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
};
const OWN_GROUP: Record<TRole, keyof typeof PAGES> = { PATIENT: "patient", DOCTOR: "doctor", ADMIN: "admin", SUPER_ADMIN: "admin" };

describe("every role on every route group", () => {
  for (const [group, path] of Object.entries(PAGES)) {
    it(`anonymous -> ${group}`, async () => {
      const { to } = await outcome(request(path));
      const protectedGroup = !["public", "login"].includes(group);
      expect(to).toBe(protectedGroup ? `/login?redirect=${encodeURIComponent(path)}` : "next");
    });
  }

  for (const role of ["PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN"] as TRole[]) {
    for (const [group, path] of Object.entries(PAGES)) {
      it(`${role} -> ${group}`, async () => {
        const { to } = await outcome(request(path, loggedIn(role)));
        let expected = "next";
        if (group === "login") expected = DASHBOARD[role];
        else if (["patient", "doctor", "admin"].includes(group) && group !== OWN_GROUP[role]) expected = DASHBOARD[role];
        expect(to).toBe(expected);
      });
    }
  }
});

describe("tokens", () => {
  it("a missing access token without refresh cookies -> login, protected pages only", async () => {
    expect((await outcome(request(PAGES.patient, { refreshToken: "x" }))).to).toMatch(/^\/login\?redirect=/);
    expect((await outcome(request(PAGES.public, { refreshToken: "x" }))).to).toBe("next");
  });

  it("an access token signed with another secret -> login, cookies cleared", async () => {
    const forged = accessToken("ADMIN", { secret: "attacker-secret" });
    const { res, to } = await outcome(request(PAGES.admin, { accessToken: forged }));
    expect(to).toMatch(/^\/login\?redirect=/);
    expect(setCookies(res)).toMatch(/accessToken=;/);
  });

  it("a tampered role claim is not accepted", async () => {
    const [header, , signature] = accessToken("PATIENT").split(".");
    const payload = Buffer.from(JSON.stringify({ userId: "u", role: "ADMIN", sid: "s", exp: Math.floor(Date.now() / 1000) + 600 })).toString("base64url");
    const { to } = await outcome(request(PAGES.admin, { accessToken: `${header}.${payload}.${signature}` }));
    expect(to).toMatch(/^\/login\?redirect=/);
  });

  it("expired access token: refreshes once, renders the page and sets the new cookies", async () => {
    const fresh = accessToken("PATIENT");
    const fetchMock = vi.fn(async () =>
      new Response(null, {
        status: 200,
        headers: [
          ["set-cookie", `accessToken=${fresh}; Path=/; HttpOnly; Max-Age=900`],
          ["set-cookie", "refreshToken=new-refresh; Path=/; HttpOnly; Max-Age=604800"],
          ["set-cookie", "better-auth.session_token=session-token; Path=/; HttpOnly"],
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { res, to } = await outcome(request(PAGES.patient, loggedIn("PATIENT", accessToken("PATIENT", { expiresIn: -10 }))));
    expect(to).toBe("next");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe("http://api.test/api/v1/auth/refresh-token");
    expect(setCookies(res)).toContain(`accessToken=${fresh}`);
    expect(setCookies(res)).toContain("refreshToken=new-refresh");
  });

  it("an access token about to expire (< 2 minutes) is refreshed too", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200, headers: [["set-cookie", `accessToken=${accessToken("DOCTOR")}; Path=/`]] }));
    vi.stubGlobal("fetch", fetchMock);
    const { to } = await outcome(request(PAGES.doctor, loggedIn("DOCTOR", accessToken("DOCTOR", { expiresIn: 60 }))));
    expect(to).toBe("next");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refresh rejected by the API (session gone) -> login and every auth cookie cleared", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));
    const { res, to } = await outcome(request(PAGES.patient, loggedIn("PATIENT", accessToken("PATIENT", { expiresIn: -10 }))));
    expect(to).toBe(`/login?redirect=${encodeURIComponent(PAGES.patient)}`);
    const cleared = setCookies(res);
    for (const name of ["accessToken", "refreshToken", "better-auth.session_token"]) expect(cleared).toMatch(new RegExp(`${name}=;`));
  });

  it("API unreachable during refresh -> protected page goes to login, cookies are kept for a retry", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNREFUSED"); }));
    const { res, to } = await outcome(request(PAGES.patient, loggedIn("PATIENT", accessToken("PATIENT", { expiresIn: -10 }))));
    expect(to).toMatch(/^\/login\?redirect=/);
    expect(setCookies(res)).not.toMatch(/refreshToken=;/);
  });

  it("an account that must change its password is sent to /change-password", async () => {
    const token = accessToken("DOCTOR", { needPasswordChange: true });
    expect((await outcome(request(PAGES.doctor, loggedIn("DOCTOR", token)))).to).toBe("/change-password?required=1");
    expect((await outcome(request("/change-password", loggedIn("DOCTOR", token)))).to).toBe("next");
  });

  it("/login?expired=1 shows the login form and drops the cookies even with a valid token", async () => {
    const { res, to } = await outcome(request("/login?expired=1", loggedIn("PATIENT")));
    expect(to).toBe("next");
    expect(setCookies(res)).toMatch(/accessToken=;/);
  });

  it("keeps the query string in the login redirect", async () => {
    const { to } = await outcome(request("/dashboard/my-appointments?tab=past"));
    expect(to).toBe(`/login?redirect=${encodeURIComponent("/dashboard/my-appointments?tab=past")}`);
  });
});

describe("security headers", () => {
  it("every response gets a CSP with a fresh nonce", async () => {
    const a = await proxy(request("/"));
    const b = await proxy(request("/"));
    const cspA = a.headers.get("Content-Security-Policy") ?? "";
    expect(cspA).toMatch(/script-src[^;]*'nonce-[A-Za-z0-9+/=]+'/);
    expect(cspA).not.toBe(b.headers.get("Content-Security-Policy"));
  });
});
