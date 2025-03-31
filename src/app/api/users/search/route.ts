import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		// Auth kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// URL parametrelerini al
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search") || "";

		// Kullanıcıları ara
		const users = await prisma.user.findMany({
			where: {
				OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }],
				userAccountStatus: "ACTIVE", // Sadece aktif kullanıcıları getir
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
			orderBy: [{ name: "asc" }, { email: "asc" }],
			take: 10, // Maksimum 10 sonuç döndür
		});

		return NextResponse.json({ users });
	} catch (error) {
		console.error("Error in user search:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
