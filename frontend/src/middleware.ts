import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { Session } from "better-auth/types";
import { mapCountryToRegion, REGION_COOKIE_NAME } from "./lib/region";

export default async function authMiddleware(request: NextRequest) {
    const { nextUrl } = request;
    const isDashboardRoute = nextUrl.pathname.startsWith("/admin");
    const isLoginRoute = nextUrl.pathname === "/admin/login";
    const isSetupRoute = nextUrl.pathname === "/admin/setup";

    let response = NextResponse.next();

    // 1. Geo-Detection & Region Setting
    // Check if region cookie exists
    if (!request.cookies.has(REGION_COOKIE_NAME)) {
        const country = request.headers.get("x-vercel-ip-country") || 
                        request.headers.get("cf-ipcountry") || 
                        null;
        
        const detectedRegion = mapCountryToRegion(country);
        
        // Use a temporary redirect or just set the cookie on the response
        // Setting it on the response works for the subsequent side-effects
        response.cookies.set(REGION_COOKIE_NAME, detectedRegion, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            sameSite: 'lax'
        });
        
        console.log(`[GEO-DETECTION] Detected country: ${country}, auto-setting region: ${detectedRegion}`);
    }

    // 2. Admin Authentication Guard
    if (isDashboardRoute && !isLoginRoute && !isSetupRoute) {
        try {
            const { data } = await betterFetch<{ session: Session; user: any }>(
                "/api/admin-auth/get-session",
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
                // If they have a customer session but not admin, send to home
                return NextResponse.redirect(new URL("/", request.url));
            }
            
            return response;
        } catch (error) {
           console.error("Middleware Admin Auth Error:", error);
           if (!isLoginRoute) {
               return NextResponse.redirect(new URL("/admin/login", request.url));
           }
        }
    }
    return response;
}

export const config = {
    matcher: ["/admin/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
