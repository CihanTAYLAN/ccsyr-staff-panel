import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EUserType } from "@prisma/client";

// GET /api/dashboard/timeline - Dashboard için zaman çizelgesi olayları
export async function GET(req: NextRequest) {
	try {
		// Kullanıcı oturumunu kontrol et
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Kullanıcının rolünü kontrol et (sadece SuperAdmin ve ManagerAdmin erişebilir)
		const user = await prisma.user.findUnique({
			where: { email: session.user.email as string },
		});

		if (!user || (user.userType !== EUserType.SUPER_ADMIN && user.userType !== EUserType.MANAGER_ADMIN)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// URL parametrelerini al
		const url = new URL(req.url);
		const limit = Number(url.searchParams.get("limit") || 10);
		const locationId = url.searchParams.get("locationId");
		const userId = url.searchParams.get("userId");
		const startDate = url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate") as string) : undefined;
		const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate") as string) : undefined;

		// Filtreleme için koşulları oluştur
		const where: any = {};

		if (locationId) {
			where.locationId = locationId;
		}

		if (userId) {
			where.userId = userId;
		}

		if (startDate || endDate) {
			where.created_at = {};

			if (startDate) {
				where.created_at.gte = startDate;
			}

			if (endDate) {
				where.created_at.lte = endDate;
			}
		}

		// En son erişim günlüklerini getir
		const timeline = await prisma.accessLog.findMany({
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
				created_at: "desc",
			},
			take: limit,
		});

		return NextResponse.json({
			items: timeline,
			totalCount: timeline.length,
			hasMore: timeline.length === limit,
		});
	} catch (error) {
		console.error("Dashboard timeline error:", error);
		return NextResponse.json({ error: "Failed to fetch dashboard timeline" }, { status: 500 });
	}
}
