import { NextRequest, NextResponse } from "next/server";
import JwtUtils from "./lib/jwtUtils";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoutes,
  UserRole,
} from "./lib/authUtils";

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    console.log("pathname: ", pathname);
    const accessToken = request.cookies.get("accessToken")?.value;
    console.log("accessToken: ", accessToken);
    const decodedAccessToken =
      accessToken &&
      JwtUtils.verifyToken(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ).data;
    console.log("decodedAccessToken", decodedAccessToken);
    const isValidToken =
      accessToken &&
      JwtUtils.verifyToken(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ).success;
    let userRole: UserRole | null = null;
    if (decodedAccessToken) {
      userRole = decodedAccessToken.role;
    }
    const routeOwner = getRouteOwner(pathname);
    const unifySuperAdminAndAdminRole =
      userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;
    userRole = unifySuperAdminAndAdminRole;
    const isAuth = isAuthRoutes(pathname);
    //Rule: 1  - if route is auth route and user is logged in, redirect to dashboard
    if (isAuth && isValidToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }
    //Rule2: 2 - if route owner want to go change password then redirect to change password page
    if (routeOwner === "COMMON") {
      return NextResponse.next();
    }
    //Rule -3 - user trying access public route
    if (routeOwner === null) {
      return NextResponse.next();
    }
    // Rule - 4 not login but want to access private route
    if (!accessToken && !isValidToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Rule - 5 user trying access private role based  route but not have the required role
    if (
      routeOwner === "ADMIN" ||
      routeOwner === "DOCTOR" ||
      routeOwner === "PATIENT"
    ) {
      if (routeOwner !== userRole) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
        );
      }
    }
    return NextResponse.next();
  } catch (error) {
    console.log("Error proxy middleware", error);
  }
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
