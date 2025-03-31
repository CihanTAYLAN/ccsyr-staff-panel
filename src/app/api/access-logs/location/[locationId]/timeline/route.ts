import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { locationId: string } }) {
	try {
		const logs = await prisma.accessLog.findMany({
			where: {
				locationId: params.locationId,
			},
			select: {
				id: true,
				actionType: true,
				actionDate: true,
				user: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				actionDate: "desc",
			},
			take: 10,
		});

		return NextResponse.json(logs);
	} catch (error) {
		console.error("Error fetching location timeline:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
