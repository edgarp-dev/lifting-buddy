import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    const response = await updateSession(request);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                },
            },
        },
    );

    const { data: { user } } = await supabase.auth.getUser();

    const protectedRoutes = ["/dashboard"];
    const isProtectedRouted = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    const authRoutes = ["/auth/login"];
    const isAuthRoute = authRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (request.nextUrl.pathname === "/") {
        if (user) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        } else {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    if (isProtectedRouted && !user) {
        const redirectUrl = new URL("/auth/login", request.url);
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
