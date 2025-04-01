import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { EUserAccountStatus } from "@prisma/client";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			userType: string;
			currentLocation?: {
				id: string;
				name: string;
				address?: string;
			} | null;
		};
	}

	interface User {
		id: string;
		userType: string;
		currentLocation?: {
			id: string;
			name: string;
			address?: string;
		} | null;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		userType: string;
		currentLocation?: {
			id: string;
			name: string;
			address?: string;
		} | null;
	}
}

export const authOptions: NextAuthOptions = {
	debug: process.env.NODE_ENV === "development",
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required");
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
					include: {
						currentLocation: true,
					},
				});

				if (!user) {
					throw new Error("Invalid email or password");
				}

				if (user.userAccountStatus === EUserAccountStatus.INACTIVE) {
					throw new Error("Account is inactive. Please contact an administrator.");
				}

				const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

				if (!isPasswordValid) {
					throw new Error("Invalid email or password");
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					userType: user.userType,
					currentLocation: user.currentLocation
						? {
								id: user.currentLocation.id,
								name: user.currentLocation.name,
								address: user.currentLocation.address || undefined,
						  }
						: null,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 gün
		updateAge: 24 * 60 * 60, // 24 saat
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/auth/login",
		error: "/auth/error",
		signOut: "/auth/signout",
	},
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.userType = user.userType;
				token.currentLocation = user.currentLocation;
			}

			if (trigger === "update" && session) {
				if (session.currentLocation) {
					token.currentLocation = session.currentLocation;
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id;
				session.user.userType = token.userType;
				session.user.currentLocation = token.currentLocation;
			}
			return session;
		},
	},
};
