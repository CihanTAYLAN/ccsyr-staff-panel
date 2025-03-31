import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const log = await prisma.accessLog.findUnique({
			where: {
				id: params.id,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				location: {
					select: {
						id: true,
						name: true,
						address: true,
						latitude: true,
						longitude: true,
					},
				},
			},
		});

		if (!log) {
			return NextResponse.json({ error: "Access log not found" }, { status: 404 });
		}

		return NextResponse.json(log);
	} catch (error) {
		console.error("Error fetching access log:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
