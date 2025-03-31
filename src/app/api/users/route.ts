import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EUserType, EUserAccountStatus } from "@prisma/client";
import { extractRequestParams, getPaginationValues, calculatePaginationMeta, parseSortingToQuery, createSearchQuery } from "@/lib/utils/queryUtils";

// GET /api/users - Kullanıcıları listele (pagination, filtreleme ve arama desteği ile)
export async function GET(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// URL parametrelerini al
		const searchParams = request.nextUrl.searchParams;
		const { page, pageSize, search, sortField, sortOrder } = extractRequestParams(searchParams);
		const userType = searchParams.get("userType") || undefined;
		const status = searchParams.get("status") || undefined;
		const userAccountStatus = searchParams.get("userAccountStatus") || undefined;

		// Sıralama için parametreleri al
		const sortQuery = parseSortingToQuery({ sortField, sortOrder });

		// Sayfalama için hesaplamalar
		const { skip, take } = getPaginationValues({ page, pageSize });

		// Filtreler için where koşulu oluştur
		let where: any = {};

		// Arama filtresi
		if (search) {
			where = { ...where, ...createSearchQuery({ search, searchFields: ["name", "email"] }) };
		}

		// Kullanıcı tipi filtresi
		if (userType) {
			where.userType = userType;
		}

		// Durum filtresi
		if (status) {
			where.status = status;
		}

		// Hesap durumu filtresi
		if (userAccountStatus) {
			where.userAccountStatus = userAccountStatus;
		}

		// Toplam kullanıcı sayısını al
		const totalUsers = await prisma.user.count({ where });

		// Kullanıcıları getir (şifre hariç)
		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				userType: true,
				status: true,
				userAccountStatus: true,
				forcePasswordChange: true,
				created_at: true,
				updated_at: true,
				currentLocation: {
					select: {
						id: true,
						name: true,
					},
				},
				_count: {
					select: {
						logs: true,
					},
				},
			},
			where,
			orderBy: sortQuery,
			skip,
			take,
		});

		// Sayfalama bilgilerini hazırla
		const pagination = calculatePaginationMeta(totalUsers, { page, pageSize });

		return NextResponse.json({
			users,
			pagination,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// POST /api/users - Yeni kullanıcı oluştur
export async function POST(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session || session.user.userType !== EUserType.SUPER_ADMIN) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Gerekli alanların kontrolü
		if (!data.email || !data.password || !data.userType) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// E-posta kontrolü
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existingUser) {
			return NextResponse.json({ error: "Email already in use" }, { status: 400 });
		}

		// Şifre hash'leme için bcrypt kullanımı
		const bcrypt = require("bcrypt");
		const hashedPassword = await bcrypt.hash(data.password, 10);

		// Yeni kullanıcı oluşturma
		const newUser = await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				password: hashedPassword,
				userType: data.userType,
				userAccountStatus: data.userAccountStatus || EUserAccountStatus.ACTIVE,
				forcePasswordChange: data.forcePasswordChange || false,
			},
			select: {
				id: true,
				name: true,
				email: true,
				userType: true,
				status: true,
				userAccountStatus: true,
				forcePasswordChange: true,
				currentLocation: {
					select: {
						id: true,
						name: true,
					},
				},
				created_at: true,
			},
		});

		return NextResponse.json(newUser, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
