import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "5");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const locationId = searchParams.get("locationId");

		const where = {
			userId: params.id,
			...(startDate && endDate
				? {
						actionDate: {
							gte: new Date(startDate),
							lte: new Date(endDate),
						},
				  }
				: {}),
			...(locationId ? { locationId } : {}),
		};

		const [total, items] = await Promise.all([
			prisma.accessLog.count({ where }),
			prisma.accessLog.findMany({
				where,
				select: {
					id: true,
					actionType: true,
					actionDate: true,
					ipAddress: true,
					browser: true,
					os: true,
					device: true,
					locationStaticName: true,
					locationStaticAddress: true,
					locationStaticLat: true,
					locationStaticLong: true,
					created_at: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: {
					actionDate: "desc",
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
		]);

		// Tarihleri ISO string formatına dönüştür ve alan isimlerini düzelt
		const formattedItems = items.map((item) => ({
			...item,
			actionDate: item.actionDate.toISOString(),
			created_at: item.created_at.toISOString(),
			locationStaticLatitude: item.locationStaticLat,
			locationStaticLongitude: item.locationStaticLong,
		}));

		return NextResponse.json({
			items: formattedItems,
			total,
			page,
			limit,
		});
	} catch (error) {
		console.error("Error in user timeline API:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
