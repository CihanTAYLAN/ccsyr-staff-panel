import { EUserType, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { exec } from "child_process";

const seedFirstUser = async (database: PrismaClient) => {
	console.log("[First Check Script]: \x1b[36m%s\x1b[0m", "Seeding database for user...");
	console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Generating admin password...");
	const email = "admin@admin.com";
	const password = Math.random().toString(36).substring(2, 15);
	console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Creating admin user...");
	await database.user.create({
		data: {
			name: "Admin",
			email,
			password: await bcrypt.hash(password, 10),
			userType: EUserType.SUPER_ADMIN,
			forcePasswordChange: true,
		},
	});
	console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "--------------------------------");
	console.table({ email, password });
	console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "--------------------------------");

	console.log("[First Check Script]: \x1b[32m%s\x1b[0m", "Created admin user");
};

const seedFirstLocation = async (database: PrismaClient) => {
	console.log("[First Check Script]: \x1b[36m%s\x1b[0m", "Seeding database for location...");
	console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Generating default location...");
	await database.location.create({
		data: {
			name: "Default Location",
			description: "Created by system",
			address: "Toronto, ON, Canada",
			latitude: 43.65107,
			longitude: -79.347015,
		},
	});
	console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Created default location");
};
const firstCheck = async () => {
	console.log("Checking Database status...");

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("DATABASE_URL is not set");
		process.exit(1);
	}

	const database = new PrismaClient({
		datasources: {
			db: {
				url: databaseUrl,
			},
		},
	});

	let errorStep = "connection";

	try {
		console.log("[First Check Script]: \x1b[36m%s\x1b[0m", "Connecting to database...");
		await database.$connect();
		console.log("[First Check Script]: \x1b[32m%s\x1b[0m", "Database connected");
		errorStep = "users";
		console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Checking users table...");
		const users = await database.user.findMany();
		if (users.length === 0) {
			errorStep = "seed";
			console.log("[First Check Script]: \x1b[31m%s\x1b[0m", "No users found");
			await seedFirstUser(database);
		} else {
			console.log("[First Check Script]: \x1b[35m%s\x1b[0m", `We have ${users.length} users`);
		}

		errorStep = "locations";
		console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Checking locations table...");
		const locations = await database.location.findMany();
		if (locations.length === 0) {
			errorStep = "seed";
			console.log("[First Check Script]: \x1b[31m%s\x1b[0m", "No locations found");
			await seedFirstLocation(database);
		} else {
			console.log("[First Check Script]: \x1b[35m%s\x1b[0m", `We have ${locations.length} locations`);
		}

		console.log("[First Check Script]: \x1b[36m%s\x1b[0m", "Disconnecting from database...");
		await database.$disconnect();
		console.log("[First Check Script]: \x1b[32m%s\x1b[0m", "Database disconnected");
	} catch (error) {
		if (errorStep === "connection") {
			console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Please check your DATABASE_URL");
		} else if (errorStep === "users" || errorStep === "locations") {
			console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Database is empty");
			console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Migrating Database");
			const migration = exec("npx prisma db push");
			migration.stdout?.on("data", async (data) => {
				console.log(data);
			});
			migration.stderr?.on("data", (data) => {
				console.error("[First Check Script]: \x1b[33m%s\x1b[0m", data);
			});
			migration.on("close", async (data) => {
				if (data === 0) {
					console.log("[First Check Script]: \x1b[32m%s\x1b[0m", "Database migrated");
					console.log("[First Check Script]: \x1b[33m%s\x1b[0m", "Seeding Database");
					await seedFirstUser(database);
					await seedFirstLocation(database);
				} else {
					console.error("[First Check Script]: \x1b[33m%s\x1b[0m", "Database migration failed");
					process.exit(1);
				}
			});
		} else {
			console.error("[First Check Script]: \x1b[33m%s\x1b[0m", "We have an unknown error");
			console.error("[First Check Script]: \x1b[33m%s\x1b[0m", "step:", errorStep);
			console.error("[First Check Script]: \x1b[31m%s\x1b[0m", error);
		}
	}
};

firstCheck();
