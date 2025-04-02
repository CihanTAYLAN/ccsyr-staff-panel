import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/users/[id] - Kullanıcı detaylarını getir
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = params.id;

		// Kullanıcı detaylarını getir (şifre hariç)
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				userType: true,
				status: true,
				userAccountStatus: true,
				forcePasswordChange: true,
				lastLoginDate: true,
				lastLoginUseragent: true,
				lastLoginOs: true,
				lastLoginDevice: true,
				lastLoginBrowser: true,
				lastLoginIpAddress: true,
				lastLogoutDate: true,
				lastLoginLocationStaticName: true,
				lastLoginLocationStaticAddress: true,
				lastLoginLocationStaticLat: true,
				lastLoginLocationStaticLong: true,
				currentLocation: {
					select: {
						id: true,
						name: true,
						address: true,
					},
				},
				created_at: true,
				updated_at: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Kullanıcının erişim kayıtlarını son 50 ile sınırlı getir
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
			take: 50,
		});

		return NextResponse.json({
			user,
			accessLogs,
		});
	} catch (error) {
		console.error("Error fetching user details:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// PUT /api/users/[id] - Kullanıcı bilgilerini güncelle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = params.id;
		const data = await request.json();

		// Güncelleme için gerekli alanların kontrolü
		if (!data.email || !data.userType) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Kullanıcı varlığını kontrol et
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// E-posta değiştiyse ve başka kullanıcı tarafından kullanılıyorsa kontrolü
		if (data.email !== existingUser.email) {
			const emailExists = await prisma.user.findUnique({
				where: { email: data.email },
			});

			if (emailExists) {
				return NextResponse.json({ error: "Email already in use" }, { status: 400 });
			}
		}

		// Güncelleme verileri
		const updateData: any = {
			name: data.name,
			email: data.email,
			userType: data.userType,
			userAccountStatus: data.userAccountStatus,
			forcePasswordChange: data.forcePasswordChange,
			// status (ONLINE/OFFLINE) admin tarafından güncellenemez
		};

		// Şifre değiştirilmek isteniyorsa
		if (data.password) {
			const bcrypt = require("bcrypt");
			updateData.password = await bcrypt.hash(data.password, 10);
		}

		// Kullanıcıyı güncelle
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: updateData,
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
				updated_at: true,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// DELETE /api/users/[id] - Kullanıcıyı sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = params.id;

		// Kullanıcının erişim kayıtlarını sil (Foreign key constraint)
		await prisma.accessLog.updateMany({
			where: { userId },
			data: {
				locationId: null,
			},
		});

		// Kullanıcıyı sil
		await prisma.user.delete({
			where: { id: userId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
