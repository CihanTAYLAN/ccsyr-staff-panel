import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/locations/[id] - Lokasyon detaylarını getir
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const locationId = params.id;

		// Lokasyon detaylarını getir
		const location = await prisma.location.findUnique({
			where: { id: locationId },
			select: {
				id: true,
				name: true,
				description: true,
				address: true,
				latitude: true,
				longitude: true,
				created_at: true,
				updated_at: true,
				activeUsers: {
					select: {
						id: true,
						name: true,
						email: true,
						userType: true,
						status: true,
					},
				},
				_count: {
					select: {
						logs: true,
						activeUsers: true,
					},
				},
				logs: {
					select: {
						id: true,
						created_at: true,
						actionType: true,
						actionDate: true,
						locationStaticName: true,
						locationStaticAddress: true,
						userAgent: true,
						browser: true,
						os: true,
						device: true,
						ipAddress: true,
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
					orderBy: {
						created_at: "desc",
					},
				},
			},
		});

		if (!location) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		return NextResponse.json({ location });
	} catch (error) {
		console.error("Error fetching location details:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// PUT /api/locations/[id] - Lokasyon bilgilerini güncelle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const locationId = params.id;
		const data = await request.json();

		// Gerekli alanların kontrolü
		if (!data.name) {
			return NextResponse.json({ error: "Location name is required" }, { status: 400 });
		}

		// Lokasyon varlığını kontrol et
		const existingLocation = await prisma.location.findUnique({
			where: { id: locationId },
		});

		if (!existingLocation) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		// Lokasyonu güncelle
		const updatedLocation = await prisma.location.update({
			where: { id: locationId },
			data: {
				name: data.name,
				description: data.description,
				address: data.address,
				latitude: data.latitude,
				longitude: data.longitude,
			},
			select: {
				id: true,
				name: true,
				description: true,
				address: true,
				latitude: true,
				longitude: true,
				updated_at: true,
			},
		});

		return NextResponse.json(updatedLocation);
	} catch (error) {
		console.error("Error updating location:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// DELETE /api/locations/[id] - Lokasyonu sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		// Oturum kontrolü
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const locationId = params.id;

		// Lokasyonun ilişkili kullanıcılarını kontrol et
		const locationWithUsers = await prisma.location.findUnique({
			where: { id: locationId },
			select: {
				_count: {
					select: {
						activeUsers: true,
					},
				},
			},
		});

		if (locationWithUsers && locationWithUsers._count.activeUsers > 0) {
			return NextResponse.json(
				{
					error: "Cannot delete location with active users. Please reassign users first.",
				},
				{ status: 400 }
			);
		}

		// Lokasyonla ilişkili erişim kayıtlarını null olarak ayarla
		// Bu kayıtları silmek yerine null yapmak daha uygun olabilir
		// Gerektiğinde silmek için deleteMany kullanılabilir

		// Lokasyonu sil
		await prisma.location.delete({
			where: { id: locationId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting location:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
