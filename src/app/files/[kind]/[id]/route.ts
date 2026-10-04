import { httpClient } from "@/lib/axios/httpClient";
import { NextRequest, NextResponse } from "next/server";

// Opens a private file (medical report, prescription PDF, invoice). The API checks that the
// user may see it, writes the read to the audit log and returns a link that expires in a few
// minutes; we redirect to it. The page links point here, never at the stored file.
const KINDS = new Set(["reports", "prescriptions", "invoices"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const notFound = () =>
  new NextResponse("This file is not available. It may have been removed, or you don't have access to it.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });

export async function GET(request: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (!KINDS.has(kind) || !UUID.test(id)) return notFound();
  try {
    const { data } = await httpClient.get<{ url: string }>(`/files/${kind}/${id}`);
    const response = NextResponse.redirect(data.url, 303);
    response.headers.set("Cache-Control", "no-store");
    // don't leak the signed link to the next site via Referer
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) {
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", `/files/${kind}/${id}`);
      return NextResponse.redirect(login, 303);
    }
    return notFound();
  }
}
