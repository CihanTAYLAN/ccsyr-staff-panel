import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { EUserType } from "@prisma/client";

const publicPaths = ["/auth/login", "/auth/forgot-password"];
const publicFiles = ["/favicon.ico", "/images/ccsyr-logo.png", "/images/marker-icon.png", "/images/marker-shadow.png"];

const apiRulesOfAccess = [
	{
		pathStartsWith: "/api/dashboard",
		methods: [
			{
				method: "GET",
				roles: [EUserType.SUPER_ADMIN, EUserType.MANAGER_ADMIN],
			},
		],
	},
	{
		pathStartsWith: "/api/locations",
		methods: [
			{
				method: "GET",
				roles: [EUserType.SUPER_ADMIN, EUserType.MANAGER_ADMIN],
			},
			{
				method: "POST",
				roles: [EUserType.SUPER_ADMIN],
			},
			{
				method: "PUT",
				roles: [EUserType.SUPER_ADMIN],
			},
			{
				method: "DELETE",
				roles: [EUserType.SUPER_ADMIN],
			},
		],
	},
	{
		pathStartsWith: "/api/access-logs",
		methods: [
			{
				method: "GET",
				roles: [EUserType.SUPER_ADMIN, EUserType.MANAGER_ADMIN],
			},
		],
	},
	{
		pathStartsWith: "/api/users",
		methods: [
			{
				method: "GET",
				roles: [EUserType.SUPER_ADMIN, EUserType.MANAGER_ADMIN],
			},
			{
				method: "POST",
				roles: [EUserType.SUPER_ADMIN],
			},
			{
				method: "PUT",
				roles: [EUserType.SUPER_ADMIN],
			},
			{
				method: "DELETE",
				roles: [EUserType.SUPER_ADMIN],
			},
		],
	},
	{
		pathStartsWith: "/api/profile",
		methods: [
			{
				method: "GET",
				roles: [EUserType.SUPER_ADMIN, EUserType.MANAGER_ADMIN, EUserType.PERSONAL],
			},
			{
				method: "PUT",
				roles: [EUserType.SUPER_ADMIN, EUserType.MANAGER_ADMIN, EUserType.PERSONAL],
			},
		],
	},
];

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;
	// console.log(request.nextUrl);

	// Define public paths that don't require authentication
	const isPublicPath = publicPaths.includes(path);

	// Allow access to public files without authentication
	if (path.startsWith("/_next/") || publicFiles.includes(path)) {
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

	// API Authorization
	const userRole = token?.userType as EUserType;

	// Find matching rule
	const rule = apiRulesOfAccess.find((r) => path.startsWith(r.pathStartsWith));
	if (rule) {
		// Find matching method
		const methodRule = rule.methods.find((m) => m.method === request.method);
		if (!methodRule) {
			return new NextResponse(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
		}

		// Check role authorization
		if (!methodRule.roles.includes(userRole)) {
			return new NextResponse(JSON.stringify({ error: "You are not authorized to access this resource" }), { status: 403, headers: { "Content-Type": "application/json" } });
		}
	}

	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
