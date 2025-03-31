import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EActionType, EUserStatus } from "@prisma/client";
import { getUserAgentDetails } from "@/lib/utils/userAgentUtils";

// POST /api/access-logs/check-out - Kullanıcı check-out işlemi
export async function POST(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Request body'den çıkış tarihi bilgisini alalım
		const data = await request.json();
		const { sessionDate } = data;

		// Kullanıcı bilgilerini getir
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: {
				currentLocation: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Kullanıcının şu anki lokasyonunu kontrol et
		if (!user.currentLocationId) {
			return NextResponse.json({ error: "No active check-in found for this user" }, { status: 400 });
		}

		// Lokasyon bilgilerini getir
		const location = await prisma.location.findUnique({
			where: { id: user.currentLocationId },
		});

		if (!location) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		// Tarayıcı ve cihaz bilgilerini al
		const userAgentDetails = getUserAgentDetails(request.headers.get("user-agent") || "");
		const ipAddress = request.headers.get("x-forwarded-for") || request.ip || "127.0.0.1";

		// actionDate değerini ayarla (gönderilmemişse şu anki tarih)
		const actionDate = sessionDate ? new Date(sessionDate) : new Date();
		const currentTime = new Date();

		// AccessLog oluştur
		const accessLog = await prisma.accessLog.create({
			data: {
				actionType: EActionType.CHECK_OUT,
				actionDate,
				ipAddress,
				userAgent: request.headers.get("user-agent") || "",
				browser: userAgentDetails.browser,
				os: userAgentDetails.os,
				device: userAgentDetails.device,
				locationStaticName: location.name,
				locationStaticAddress: location.address || "",
				locationStaticLat: location.latitude || 0,
				locationStaticLong: location.longitude || 0,
				user: { connect: { id: user.id } },
				location: { connect: { id: location.id } },
				userStaticName: user.name,
				userStaticEmail: user.email,
				userStaticLastLoginDate: new Date(),
				userStaticLastLoginLocationName: location.name,
				userStaticLastLoginLocationAddress: location.address || "",
				userStaticLastLoginLocationLat: location.latitude || 0,
				userStaticLastLoginLocationLong: location.longitude || 0,
			},
		});

		// Kullanıcının durumunu güncelle
		await prisma.user.update({
			where: { id: user.id },
			data: {
				currentLocationId: null,
				status: EUserStatus.OFFLINE,
				lastLogoutDate: currentTime,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Check-out successful",
			accessLog,
		});
	} catch (error) {
		console.error("Error during check-out:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
