import { locationSeedData } from "../data/locationSeedData";
import { prismaClient } from "../seed";

export async function locationSeed() {
	const locationCount = await prismaClient.location.count();
	if (locationCount > 0) {
		console.log("\x1b[33m✨ Location seed completed! \x1b[0m");
		return;
	}

	for (const item of locationSeedData) {
		await prismaClient.location.upsert({
			where: { id: item.id },
			update: {},
			create: {
				...item,
				latitude: item.latitude,
				longitude: item.longitude,
			},
		});
	}

	console.log("\x1b[33m✨ Location seed completed! \x1b[0m");
}
