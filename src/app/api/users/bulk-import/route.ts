import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EUserType } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
	try {
		const { users } = await request.json();

		// Email kontrolü
		const emails = users.map((user: any) => user.email);
		const existingUsers = await prisma.user.findMany({
			where: {
				email: {
					in: emails,
				},
			},
			select: {
				email: true,
			},
		});

		if (existingUsers.length > 0) {
			return NextResponse.json(
				{
					error: `Following emails already exist: ${existingUsers.map((u) => u.email).join(", ")}`,
				},
				{ status: 400 }
			);
		}

		// Bulk insert
		await prisma.user.createMany({
			data: users.map((user: any) => ({
				name: user.name,
				email: user.email,
				password: bcrypt.hashSync(user.password, 10),
				userType: user.userType as EUserType,
				status: "OFFLINE",
				userAccountStatus: "ACTIVE",
				forcePasswordChange: true,
			})),
		});

		return NextResponse.json({ message: "Users imported successfully" });
	} catch (error: any) {
		console.error("Bulk import error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
