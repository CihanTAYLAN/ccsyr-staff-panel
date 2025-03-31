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

		// Lokasyonları ara
		const locations = await prisma.location.findMany({
			where: {
				OR: [{ name: { contains: search, mode: "insensitive" } }, { address: { contains: search, mode: "insensitive" } }],
			},
			select: {
				id: true,
				name: true,
				address: true,
			},
			orderBy: {
				name: "asc",
			},
			take: 10, // Maksimum 10 sonuç döndür
		});

		return NextResponse.json({ locations });
	} catch (error) {
		console.error("Error in location search:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
