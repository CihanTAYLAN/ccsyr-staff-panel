import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRequestParams, getPaginationValues, parseSortingToQuery, createSearchQuery } from "@/lib/utils/queryUtils";

// GET /api/locations - Tüm lokasyonları getir
export async function GET(request: NextRequest) {
	try {
		// URL parametrelerini al
		const searchParams = request.nextUrl.searchParams;
		const { page, pageSize, search, sortField, sortOrder } = extractRequestParams(searchParams);

		// Sıralama için parametreleri al
		const sortQuery = parseSortingToQuery({ sortField, sortOrder });

		// Sayfalama için hesaplamalar
		const { skip, take } = getPaginationValues({ page, pageSize });

		// Filtreler için where koşulu oluştur
		let where: any = {};

		// Arama filtresi
		if (search) {
			where = { ...where, ...createSearchQuery({ search, searchFields: ["name", "address"] }) };
		}

		// Tüm lokasyonları getir
		const locations = await prisma.location.findMany({
			where,
			orderBy: sortQuery,
			skip,
			take,
			select: {
				id: true,
				name: true,
				address: true,
				latitude: true,
				longitude: true,
				created_at: true,
				updated_at: true,
				_count: {
					select: {
						activeUsers: true,
					},
				},
			},
		});

		return NextResponse.json({
			success: true,
			message: "Locations fetched successfully",
			locations,
		});
	} catch (error) {
		console.error("Error fetching locations:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// POST /api/locations - Yeni lokasyon ekle (sadece admin kullanıcılar için)
export async function POST(request: NextRequest) {
	try {
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
