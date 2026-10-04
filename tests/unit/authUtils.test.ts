// plan.md 11.10: authUtils — redirect validation (no open redirects) and route owners.
import { describe, expect, it } from "vitest";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  getSafeInternalPathname,
  isAuthRoutes,
  isValidateRedirect,
} from "@/lib/authUtils";

describe("getSafeInternalPathname", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/dashboard/my-appointments?tab=past", "/dashboard/my-appointments"],
    ["/consultation/doctor/123#reviews", "/consultation/doctor/123"],
    ["/a/../admin/dashboard", "/admin/dashboard"],
  ])("accepts the internal path %s", (input, expected) => {
    expect(getSafeInternalPathname(input)).toBe(expected);
  });

  it.each([
    "https://evil.example/dashboard",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "dashboard",
    "",
    "/\tevil",
    "/\nevil",
    " /dashboard",
  ])("rejects %j", (input) => {
    expect(getSafeInternalPathname(input)).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(getSafeInternalPathname(undefined as unknown as string)).toBeNull();
  });
});

describe("getRouteOwner", () => {
  it.each([
    ["/admin/dashboard", "ADMIN"],
    ["/admin/dashboard/doctors", "ADMIN"],
    ["/doctor/dashboard/appointments", "DOCTOR"],
    ["/dashboard", "PATIENT"],
    ["/dashboard/my-prescriptions", "PATIENT"],
    ["/payment/success", "PATIENT"],
    ["/my-profile", "COMMON"],
    ["/change-password", "COMMON"],
    ["/", null],
    ["/consultation", null],
    ["/login", null],
    ["/privacy", null],
    // look-alikes are not protected areas
    ["/admin", null],
    ["/doctor/dashboardx", "DOCTOR"],
  ])("%s -> %s", (path, owner) => {
    expect(getRouteOwner(path)).toBe(owner);
  });
});

describe("isValidateRedirect", () => {
  it("allows public, common and own-role pages", () => {
    expect(isValidateRedirect("/consultation", "PATIENT")).toBe(true);
    expect(isValidateRedirect("/my-profile", "DOCTOR")).toBe(true);
    expect(isValidateRedirect("/dashboard/my-appointments", "PATIENT")).toBe(true);
    expect(isValidateRedirect("/doctor/dashboard", "DOCTOR")).toBe(true);
    expect(isValidateRedirect("/admin/dashboard", "ADMIN")).toBe(true);
  });

  it("treats SUPER_ADMIN as ADMIN", () => {
    expect(isValidateRedirect("/admin/dashboard/admins", "SUPER_ADMIN")).toBe(true);
    expect(isValidateRedirect("/dashboard", "SUPER_ADMIN")).toBe(false);
  });

  it("refuses another role's area", () => {
    expect(isValidateRedirect("/admin/dashboard", "PATIENT")).toBe(false);
    expect(isValidateRedirect("/doctor/dashboard", "PATIENT")).toBe(false);
    expect(isValidateRedirect("/dashboard", "DOCTOR")).toBe(false);
  });

  it("refuses external targets for every role", () => {
    for (const role of ["PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN"] as const) {
      expect(isValidateRedirect("https://evil.example", role)).toBe(false);
      expect(isValidateRedirect("//evil.example/dashboard", role)).toBe(false);
    }
  });
});

describe("helpers", () => {
  it("knows the auth pages (and not verify/reset, which must stay reachable)", () => {
    expect(isAuthRoutes("/login")).toBe(true);
    expect(isAuthRoutes("/register")).toBe(true);
    expect(isAuthRoutes("/forgot-password")).toBe(true);
    expect(isAuthRoutes("/verify-email")).toBe(false);
    expect(isAuthRoutes("/reset-password")).toBe(false);
  });

  it("sends every role to its own dashboard", () => {
    expect(getDefaultDashboardRoute("PATIENT")).toBe("/dashboard");
    expect(getDefaultDashboardRoute("DOCTOR")).toBe("/doctor/dashboard");
    expect(getDefaultDashboardRoute("ADMIN")).toBe("/admin/dashboard");
    expect(getDefaultDashboardRoute("SUPER_ADMIN")).toBe("/admin/dashboard");
  });
});
