import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { Session } from "better-auth/types";

export default async function authMiddleware(request: NextRequest) {
    const { nextUrl } = request;
    const isDashboardRoute = nextUrl.pathname.startsWith("/admin");
    const isLoginRoute = nextUrl.pathname === "/admin/login";
    const isSetupRoute = nextUrl.pathname === "/admin/setup";

    if (isDashboardRoute && !isLoginRoute && !isSetupRoute) {
        try {
            const { data } = await betterFetch<{ session: Session; user: any }>(
                "/api/auth/get-session",
                {
                    baseURL: request.nextUrl.origin,
                    headers: {
                        cookie: request.headers.get("cookie") || "",
                    },
                }
            );

            if (!data || !data.session) {
                return NextResponse.redirect(new URL("/admin/login", request.url));
            }

            if (!["ADMIN", "SUPER_ADMIN"].includes(data.user.role)) {
                return NextResponse.redirect(new URL("/", request.url));
            }
            
            // If we are here, user is ADMIN and session is valid.
            // If they are visiting /admin/login, send them to dashboard.
            if (isLoginRoute) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            
            return NextResponse.next();
        } catch (error) {
           console.error("Middleware Auth Error:", error);
           // Only redirect to login if we aren't already there to avoid loops
           if (!isLoginRoute) {
               return NextResponse.redirect(new URL("/admin/login", request.url));
           }
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
