import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EUserType } from "@prisma/client";

// GET /api/locations - Tüm lokasyonları getir
export async function GET(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Tüm lokasyonları getir
		const locations = await prisma.location.findMany({
			orderBy: {
				name: "asc",
			},
		});

		return NextResponse.json(locations);
	} catch (error) {
		console.error("Error fetching locations:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// POST /api/locations - Yeni lokasyon ekle (sadece admin kullanıcılar için)
export async function POST(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Kullanıcının admin olup olmadığını kontrol et
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { userType: true },
		});

		if (!user || user.userType !== EUserType.SUPER_ADMIN) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const data = await request.json();
		const { name, address, latitude, longitude } = data;

		// Gerekli alanların kontrolü
		if (!name) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		// Lokasyon oluştur
		const location = await prisma.location.create({
			data: {
				name,
				address,
				latitude: latitude ? parseFloat(latitude) : null,
				longitude: longitude ? parseFloat(longitude) : null,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Location created successfully",
			location,
		});
	} catch (error) {
		console.error("Error creating location:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
