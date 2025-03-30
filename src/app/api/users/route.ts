import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EUserType } from "@prisma/client";

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
		const page = parseInt(searchParams.get("page") || "1");
		const pageSize = parseInt(searchParams.get("pageSize") || "10");
		const search = searchParams.get("search") || "";
		const userType = searchParams.get("userType") || undefined;
		const status = searchParams.get("status") || undefined;

		// Sıralama için parametreleri al
		const sortField = searchParams.get("sortField") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		// Sayfalama için hesaplamalar
		const skip = (page - 1) * pageSize;

		// Filtreler için where koşulu oluştur
		const where: any = {};

		// Arama filtresi
		if (search) {
			where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
		}

		// Kullanıcı tipi filtresi
		if (userType) {
			where.userType = userType;
		}

		// Durum filtresi
		if (status) {
			where.status = status;
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
			orderBy: { [sortField]: sortOrder },
			skip,
			take: pageSize,
		});

		// Sayfalama bilgilerini hazırla
		const totalPages = Math.ceil(totalUsers / pageSize);
		const hasNext = page < totalPages;
		const hasPrevious = page > 1;

		return NextResponse.json({
			users,
			pagination: {
				page,
				pageSize,
				total: totalUsers,
				totalPages,
				hasNext,
				hasPrevious,
			},
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
			},
			select: {
				id: true,
				name: true,
				email: true,
				userType: true,
				status: true,
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
