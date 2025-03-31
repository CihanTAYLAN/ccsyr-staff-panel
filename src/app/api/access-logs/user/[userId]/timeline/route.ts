import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { userId: string } }) {
	try {
		const logs = await prisma.accessLog.findMany({
			where: {
				userId: params.userId,
			},
			select: {
				id: true,
				actionType: true,
				actionDate: true,
				locationStaticName: true,
			},
			orderBy: {
				actionDate: "desc",
			},
			take: 10,
		});

		return NextResponse.json(logs);
	} catch (error) {
		console.error("Error fetching user timeline:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
