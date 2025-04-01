import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/timeline - Dashboard için zaman çizelgesi olayları
export async function GET(request: NextRequest) {
	try {
		// Kullanıcı oturumunu kontrol et
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// URL parametrelerini al
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const locationId = searchParams.get("locationId");
		const userId = searchParams.get("userId");

		// Filtreleme koşullarını oluştur
		const where: any = {};

		if (startDate && endDate) {
			where.actionDate = {
				gte: new Date(startDate),
				lte: new Date(endDate),
			};
		}

		if (locationId) {
			where.locationId = locationId;
		}

		if (userId) {
			where.userId = userId;
		}

		// Toplam kayıt sayısını al
		const total = await prisma.accessLog.count({ where });

		// Verileri getir
		const items = await prisma.accessLog.findMany({
			where,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				location: {
					select: {
						id: true,
						name: true,
						address: true,
					},
				},
			},
			orderBy: {
				actionDate: "desc",
			},
			skip: (page - 1) * limit,
			take: limit,
		});

		// Yanıtı oluştur
		return NextResponse.json({
			items: items.map((item) => ({
				id: item.id,
				actionType: item.actionType,
				actionDate: item.actionDate,
				ipAddress: item.ipAddress,
				browser: item.browser,
				os: item.os,
				device: item.device,
				locationStaticName: item.locationStaticName,
				locationStaticAddress: item.locationStaticAddress,
				user: item.user,
				location: item.location,
			})),
			total,
			page,
			limit,
		});
	} catch (error) {
		console.error("Error in dashboard timeline:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
