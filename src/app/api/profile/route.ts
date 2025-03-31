import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/profile - Kullanıcı profilini getir
export async function GET(req: NextRequest) {
	try {
		// Kullanıcı oturumunu kontrol et
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Kullanıcı bilgilerini getir
		const user = await prisma.user.findUnique({
			where: { email: session.user.email as string },
			select: {
				id: true,
				name: true,
				email: true,
				userType: true,
				userAccountStatus: true,
				status: true,
				lastLoginDate: true,
				lastLoginIp: true,
				lastLoginBrowser: true,
				lastLoginOs: true,
				lastLoginDevice: true,
				lastLogoutDate: true,
				currentLocation: {
					select: {
						id: true,
						name: true,
						address: true,
						latitude: true,
						longitude: true,
					},
				},
				forcePasswordChange: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Profile fetch error:", error);
		return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
	}
}

// PUT /api/profile - Kullanıcı profilini güncelle
export async function PUT(req: NextRequest) {
	try {
		// Kullanıcı oturumunu kontrol et
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Request gövdesini al
		const body = await req.json();
		const { name, currentPassword, newPassword } = body;

		// Güncellenecek alanları içeren nesne
		const updateData: any = {};

		// Kullanıcı adı güncellemesi
		if (name) {
			updateData.name = name;
		}

		// Şifre güncellemesi
		if (currentPassword && newPassword) {
			// Kullanıcıyı bul ve şifreyi kontrol et
			const user = await prisma.user.findUnique({
				where: { email: session.user.email as string },
				select: { password: true, forcePasswordChange: true },
			});

			if (!user) {
				return NextResponse.json({ error: "User not found" }, { status: 404 });
			}

			// Zorunlu şifre değişikliği durumu veya mevcut şifrenin doğruluğunu kontrol et
			if (!user.forcePasswordChange) {
				const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
				if (!isPasswordValid) {
					return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
				}
			}

			// Yeni şifre minimum 8 karakter olmalı
			if (newPassword.length < 8) {
				return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
			}

			// Yeni şifreyi hashle
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			updateData.password = hashedPassword;

			// Eğer zorunlu şifre değişikliği varsa, bu durumu kapat
			if (user.forcePasswordChange) {
				updateData.forcePasswordChange = false;
			}
		}

		// Eğer güncellenecek bir veri yoksa hata döndür
		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No data to update" }, { status: 400 });
		}

		// Kullanıcı bilgilerini güncelle
		const updatedUser = await prisma.user.update({
			where: { email: session.user.email as string },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				userType: true,
				userAccountStatus: true,
				status: true,
				forcePasswordChange: true,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Profile update error:", error);
		return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
	}
}
