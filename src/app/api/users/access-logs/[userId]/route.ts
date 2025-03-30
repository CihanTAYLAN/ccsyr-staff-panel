import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/users/access-logs/[userId] - Belirli bir kullanıcının erişim kayıtlarını getir
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = params.userId;

		// URL parametrelerini al (Sayfalama için)
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const pageSize = parseInt(searchParams.get("pageSize") || "10");
		const skip = (page - 1) * pageSize;

		// Kullanıcı varlığını kontrol et
		const userExists = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Toplam log sayısını al
		const totalLogs = await prisma.accessLog.count({
			where: { userId },
		});

		// Kullanıcının erişim kayıtlarını getir (sayfalama ile)
		const accessLogs = await prisma.accessLog.findMany({
			where: { userId },
			include: {
				location: {
					select: {
						id: true,
						name: true,
						address: true,
					},
				},
			},
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
		});

		// Sayfalama bilgilerini hazırla
		const totalPages = Math.ceil(totalLogs / pageSize);
		const hasNext = page < totalPages;
		const hasPrevious = page > 1;

		return NextResponse.json({
			accessLogs,
			pagination: {
				page,
				pageSize,
				total: totalLogs,
				totalPages,
				hasNext,
				hasPrevious,
			},
		});
	} catch (error) {
		console.error("Error fetching user access logs:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
