import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export const prismaClient = new PrismaClient();

const seedersDir = path.join(__dirname, "seeds");

// if (process.env.NODE_ENV === 'production') {
//   seedersDir = path.join(__dirname, 'prod_seeders');
// }

async function getSeedFiles(directory: string): Promise<string[]> {
	const files: string[] = fs.readdirSync(directory);
	let seedFiles: string[] = [];

	for (const file of files) {
		const filePath = path.join(directory, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			seedFiles = seedFiles.concat(await getSeedFiles(filePath));
		} else if (file.endsWith("Seed.ts")) {
			seedFiles.push(filePath);
		}
	}

	return seedFiles;
}

async function runSeedFiles() {
	const seedFiles: string[] = await getSeedFiles(seedersDir);
	for (const seedFile of seedFiles) {
		const seedModule = await import(seedFile);
		if (typeof seedModule === "object") {
			for (const key in seedModule) {
				if (typeof seedModule[key] === "function") {
					await seedModule[key]();
				}
			}
		}
	}
}

async function main() {
	try {
		await runSeedFiles();
	} catch (e) {
		console.error(e);
	} finally {
		await prismaClient.$disconnect();
	}
}

main();
