import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

// Rastgele şifre oluşturma
function generateRandomPassword(length: number = 8) {
	const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
	let result = "";
	const charactersLength = characters.length;

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Kullanıcıyı e-posta adresine göre bul
		const user = await prisma.user.findUnique({
			where: { email },
		});

		// Kullanıcı bulunamadıysa, başarılı olduğunu söyleyelim (güvenlik nedeniyle)
		if (!user) {
			return NextResponse.json({
				success: true,
				message: "If an account with that email exists, a password reset email has been sent",
			});
		}

		// Geçici şifre ve sıfırlama tokeni oluştur
		const newPassword = generateRandomPassword();
		const resetToken = crypto.randomBytes(32).toString("hex");

		// Şifreyi hashle
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Kullanıcıyı güncelle
		await prisma.user.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
				forcePasswordChange: true, // İlk girişte şifre değiştirmeye zorla
			},
		});

		// E-posta gönder
		await sendPasswordResetEmail(email, resetToken, newPassword);

		return NextResponse.json({
			success: true,
			message: "If an account with that email exists, a password reset email has been sent",
		});
	} catch (error) {
		console.error("Password reset error:", error);
		return NextResponse.json(
			{
				error: "Something went wrong while processing your request",
			},
			{ status: 500 }
		);
	}
}
