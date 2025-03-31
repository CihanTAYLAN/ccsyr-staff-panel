import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EActionType, EUserStatus } from "@prisma/client";
import { getUserAgentDetails } from "@/lib/utils/userAgentUtils";

// POST /api/access-logs/check-in - Kullanıcı check-in işlemi
export async function POST(request: NextRequest) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();
		const { locationId, sessionDate } = data;

		// Gerekli alanların kontrolü
		if (!locationId) {
			return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
		}

		// Location kontrolü
		const location = await prisma.location.findUnique({
			where: { id: locationId },
		});

		if (!location) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		// Kullanıcı bilgilerini getir
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Tarayıcı ve cihaz bilgilerini al
		const userAgentDetails = getUserAgentDetails(request.headers.get("user-agent") || "");
		const ipAddress = request.headers.get("x-forwarded-for") || request.ip || "127.0.0.1";

		// actionDate değerini ayarla (gönderilmemişse şu anki tarih)
		const actionDate = sessionDate ? new Date(sessionDate) : new Date();

		// AccessLog oluştur
		const accessLog = await prisma.accessLog.create({
			data: {
				actionType: EActionType.CHECK_IN,
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

		// Kullanıcının lokasyonunu ve durumunu güncelle
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				currentLocationId: location.id,
				status: EUserStatus.ONLINE,
				lastLoginDate: new Date(),
				lastLoginIpAddress: ipAddress,
				lastLoginUseragent: request.headers.get("user-agent") || "",
				lastLoginBrowser: userAgentDetails.browser,
				lastLoginOs: userAgentDetails.os,
				lastLoginDevice: userAgentDetails.device,
				lastLoginLocationStaticName: location.name,
				lastLoginLocationStaticAddress: location.address || "",
				lastLoginLocationStaticLat: location.latitude || 0,
				lastLoginLocationStaticLong: location.longitude || 0,
			},
			include: {
				currentLocation: true,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Check-in successful",
			accessLog,
			currentLocation: updatedUser.currentLocation
				? {
						id: updatedUser.currentLocation.id,
						name: updatedUser.currentLocation.name,
						address: updatedUser.currentLocation.address,
				  }
				: null,
		});
	} catch (error) {
		console.error("Error during check-in:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
