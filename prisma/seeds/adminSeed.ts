import { hash } from "bcryptjs";
import { adminSeedData } from "../data/adminSeedData";
import { prismaClient } from "../seed";
import { EUserAccountStatus } from "@prisma/client";

export async function adminSeed() {
	for (const item of adminSeedData) {
		await prismaClient.user.upsert({
			where: { email: item.email },
			update: {},
			create: {
				...item,
				password: await hash(item.password, 10),
				userAccountStatus: EUserAccountStatus.ACTIVE,
				forcePasswordChange: false,
			},
		});
	}

	console.log("\x1b[33m✨ Admin seed completed! \x1b[0m");
}
