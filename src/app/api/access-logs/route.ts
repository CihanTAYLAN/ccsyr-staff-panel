import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EActionType } from "@prisma/client";
import { extractRequestParams, getPaginationValues } from "@/lib/utils/queryUtils";

// GET /api/access-logs - Access log listesi
export async function GET(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Sorgu parametrelerini al
		const searchParams = request.nextUrl.searchParams;
		const { page, pageSize, search, sortField, sortOrder } = extractRequestParams(searchParams);

		// Filtre parametrelerini al
		const userId = searchParams.get("userId");
		const locationId = searchParams.get("locationId");
		const actionType = searchParams.get("actionType");
		const dateFrom = searchParams.get("dateFrom");
		const dateTo = searchParams.get("dateTo");

		// Sayfalama için
		const { skip, take } = getPaginationValues({ page, pageSize });

		// Filtreleme için
		let where: any = {};

		if (userId) {
			where.userId = userId || undefined;
		}

		if (locationId) {
			where.locationId = locationId || undefined;
		}

		if (actionType) {
			// Kullanıcı "ALL" seçtiyse filtre uygulama
			if (actionType !== "ALL") {
				where.actionType = actionType;
			}
		}

		if (dateFrom || dateTo) {
			where.actionDate = {};

			if (dateFrom) {
				where.actionDate.gte = new Date(dateFrom);
			}

			if (dateTo) {
				where.actionDate.lte = new Date(dateTo);
			}
		}

		// Arama için
		if (search) {
			where.OR = [
				{
					user: {
						name: {
							contains: search,
							mode: "insensitive",
						},
					},
				},
				{
					user: {
						email: {
							contains: search,
							mode: "insensitive",
						},
					},
				},
				{
					locationStaticName: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					locationStaticAddress: {
						contains: search,
						mode: "insensitive",
					},
				},
			];
		}

		// Sıralama için
		const orderBy: Record<string, string> = {};
		if (sortField && sortOrder) {
			orderBy[sortField] = sortOrder.toLowerCase();
		} else {
			// Varsayılan sıralama
			orderBy["created_at"] = "desc";
		}

		// Toplam kayıt sayısını al
		const totalCount = await prisma.accessLog.count({ where });

		// Kayıtları al
		const logs = await prisma.accessLog.findMany({
			where,
			orderBy,
			skip,
			take,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						userType: true,
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
		});

		// Actiontype enum değerlerini al
		const actionTypes = Object.values(EActionType);

		return NextResponse.json({
			logs,
			totalCount,
			actionTypes,
			pagination: {
				page,
				pageSize,
				totalPages: Math.ceil(totalCount / pageSize),
				totalCount,
			},
		});
	} catch (error) {
		console.error("Error fetching access logs:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
