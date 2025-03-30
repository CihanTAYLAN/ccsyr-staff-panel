import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/locations - Lokasyonları listele
export async function GET(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// URL parametrelerini al
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search") || "";

		// Filtreleme için where koşulu
		const where: any = {};
		if (search) {
			where.OR = [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { address: { contains: search, mode: "insensitive" } }];
		}

		// Lokasyonları getir
		const locations = await prisma.location.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				address: true,
				latitude: true,
				longitude: true,
				created_at: true,
				updated_at: true,
				_count: {
					select: {
						activeUsers: true,
						logs: true,
					},
				},
			},
			where,
			orderBy: { name: "asc" },
		});

		return NextResponse.json({
			locations,
		});
	} catch (error) {
		console.error("Error fetching locations:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// POST /api/locations - Yeni lokasyon oluştur
export async function POST(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Gerekli alanların kontrolü
		if (!data.name) {
			return NextResponse.json({ error: "Location name is required" }, { status: 400 });
		}

		// Yeni lokasyon oluşturma
		const newLocation = await prisma.location.create({
			data: {
				name: data.name,
				description: data.description || null,
				address: data.address || null,
				latitude: data.latitude || null,
				longitude: data.longitude || null,
			},
			select: {
				id: true,
				name: true,
				description: true,
				address: true,
				latitude: true,
				longitude: true,
				created_at: true,
			},
		});

		return NextResponse.json(newLocation, { status: 201 });
	} catch (error) {
		console.error("Error creating location:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
