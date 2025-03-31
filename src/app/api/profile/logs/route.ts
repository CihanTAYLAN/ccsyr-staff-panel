import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/profile/logs - Kullanıcının erişim loglarını getir
export async function GET(req: NextRequest) {
	try {
		// Kullanıcı oturumunu kontrol et
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// URL parametrelerini al
		const url = new URL(req.url);
		const limit = Number(url.searchParams.get("limit") || 50);
		const startDate = url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate") as string) : undefined;
		const endDate = url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate") as string) : undefined;

		// Filtreleme için koşulları oluştur
		const where: any = {
			user: {
				email: session.user.email,
			},
		};

		if (startDate || endDate) {
			where.created_at = {};

			if (startDate) {
				where.created_at.gte = startDate;
			}

			if (endDate) {
				where.created_at.lte = endDate;
			}
		}

		// Kullanıcının log kayıtlarını getir
		const logs = await prisma.accessLog.findMany({
			where,
			include: {
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
			items: logs,
			totalCount: logs.length,
		});
	} catch (error) {
		console.error("Profile logs error:", error);
		return NextResponse.json({ error: "Failed to fetch profile logs" }, { status: 500 });
	}
}
