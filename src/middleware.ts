import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// Define public paths that don't require authentication
	const isPublicPath = path.startsWith("/auth/");

	// Allow access to public files without authentication
	if (path.startsWith("/_next/") || path.startsWith("/favicon.ico") || path.includes("/images/ccsyr-logo.png")) {
		return NextResponse.next();
	}

	// Get the token
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// Redirect logic
	if (!token && !isPublicPath) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	if (token && isPublicPath) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
