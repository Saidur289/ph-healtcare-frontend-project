import { httpClient } from "@/lib/axios/httpClient";
import { NextRequest, NextResponse } from "next/server";

// "Download my data": the API builds the export (and audits it); we hand it over as a file.
export async function GET(request: NextRequest) {
  try {
    const { data } = await httpClient.get<unknown>("/profile/me/export");
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="ph-healthcare-my-data-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) {
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", "/my-profile");
      return NextResponse.redirect(login, 303);
    }
    return new NextResponse("Your data could not be exported right now. Please try again.", {
      status: status === 403 ? 403 : 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
