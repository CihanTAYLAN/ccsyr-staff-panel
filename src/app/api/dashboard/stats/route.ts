import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EUserAccountStatus, EActionType, EUserStatus } from "@prisma/client";

// GET /api/dashboard/stats - Dashboard istatistikleri
export async function GET(req: NextRequest) {
	try {
		// Kullanıcı oturumunu kontrol et
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Toplam kullanıcı sayısı
		const totalUsers = await prisma.user.count();

		// Aktif kullanıcı sayısı (durumu "Active" olanlar)
		const onlineUsers = await prisma.user.count({
			where: { status: EUserStatus.ONLINE },
		});

		const totalActiveUsers = await prisma.user.count({
			where: { userAccountStatus: EUserAccountStatus.ACTIVE },
		});

		// Toplam lokasyon sayısı
		const totalLocations = await prisma.location.count();

		// Bugün yapılan check-in sayısı
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const todayCheckIns = await prisma.accessLog.count({
			where: {
				actionType: EActionType.CHECK_IN,
				created_at: {
					gte: today,
				},
			},
		});

		// Son 7 günlük giriş istatistikleri
		const last7Days = new Date();
		last7Days.setDate(last7Days.getDate() - 7);

		const dailyStats = await prisma.accessLog.groupBy({
			by: ["created_at"],
			where: {
				created_at: {
					gte: last7Days,
				},
			},
			_count: {
				id: true,
			},
			orderBy: {
				created_at: "asc",
			},
		});

		// Lokasyonlara göre aktif kullanıcı sayısı
		const locationStats = await prisma.location.findMany({
			select: {
				id: true,
				name: true,
				address: true,
				latitude: true,
				longitude: true,
				activeUsers: {
					where: {
						status: EUserStatus.ONLINE,
					},
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		// Son 30 gündeki toplam giriş-çıkış sayısı
		const last30Days = new Date();
		last30Days.setDate(last30Days.getDate() - 30);

		const totalAccessLogs = await prisma.accessLog.count({
			where: {
				created_at: {
					gte: last30Days,
				},
			},
		});

		// Yanıt olarak tüm istatistikleri döndür
		return NextResponse.json({
			totalUsers,
			onlineUsers,
			totalActiveUsers,
			totalLocations,
			todayCheckIns,
			dailyStats,
			locationStats,
			totalAccessLogs,
		});
	} catch (error) {
		console.error("Dashboard stats error:", error);
		return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 });
	}
}
