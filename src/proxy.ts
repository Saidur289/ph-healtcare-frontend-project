import { NextRequest, NextResponse } from "next/server";
import JwtUtils from "./lib/jwtUtils";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoutes,
  UserRole,
} from "./lib/authUtils";
import { isTokenExpiringSoon } from "./lib/tokenUtils";
import {
  getNewTokenWithRefreshToken,
  getUserInfo,
} from "./services/auth.service";
async function refreshTokenMiddleware(
  refreshToken: string,
  token: string,
): Promise<boolean> {
  try {
    const refreshed = await getNewTokenWithRefreshToken(refreshToken, token);
    if (refreshed) {
      return true;
    }
    return false;
  } catch (error) {
    console.log("Error in refresh middleware", error);
    return false;
  }
}

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const better_auth_session_token = request.cookies.get(
      "better-auth.session_token",
    )?.value;

    const decodedAccessToken =
      accessToken &&
      JwtUtils.verifyToken(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ).data;

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
    // proactively have refresh token  and accessToken is about to expired
    if (
      isValidToken &&
      refreshToken &&
      (await isTokenExpiringSoon(accessToken))
    ) {
      const requestHeaders = new Headers(request.headers);
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      try {
        const refreshed = await refreshTokenMiddleware(
          refreshToken,
          better_auth_session_token as string,
        );
        if (refreshed) {
          requestHeaders.set("x-token-refresh", "1");
        }
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
          headers: response.headers,
        });
      } catch (error) {
        console.log("error in refresh Token", error);
      }

      return response;
    }
    //Rule: 1  - if route is auth route and user is logged in, redirect to dashboard
    if (isAuth && isValidToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }
    //Rule : 2 user trying access /reset-password  route
    if (pathname === "/reset-password") {
      const email = request.nextUrl.searchParams.get("email");
      // case -1  user has need password true  in change password change
      if (accessToken && email) {
        const userInfo = await getUserInfo();
        if (userInfo.needsPasswordChange) {
          return NextResponse.next();
        } else {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }
      }
      // case - 2 user coming from forget password page
      if (email) {
        return NextResponse.next();
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    //Rule2: 2*** - if route owner want to go change password then redirect to change password page
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
    //Rule - Enforcing user to stay in reset password or verify email page if their needPasswordChange or isEmailVerified flags are not satisfied respectively
    if (accessToken) {
      const userInfo = await getUserInfo();
      if (userInfo) {
        // need password change force fully
        if (userInfo.needsPasswordChange) {
          if (pathname !== "/reset-password") {
            const resetPasswordUrl = new URL("/reset-password", request.url);
            resetPasswordUrl.searchParams.set("email", userInfo.email);
            return NextResponse.redirect(resetPasswordUrl);
          }
          return NextResponse.next();
        }
        if (!userInfo.needsPasswordChange && pathname === "/reset-password") {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }
        // email not verified
        if (userInfo.emailVerified === false) {
          if (pathname !== "/verify-email") {
            const verifyEmailUrl = new URL("/verify-email", request.url);
            verifyEmailUrl.searchParams.set("email", userInfo.email);

            return NextResponse.redirect(verifyEmailUrl);
          }
          return NextResponse.next();
        }
        if (userInfo.emailVerified && pathname === "/verify-email") {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }
      }
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
