import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			userType: string;
		};
	}

	interface User {
		id: string;
		userType: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		userType: string;
	}
}

export const authOptions: NextAuthOptions = {
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
					return null;
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user) {
					return null;
				}

				const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					userType: user.userType,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/auth/login",
		error: "/auth/error",
		signOut: "/auth/signout",
	},
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
				token.userType = user.userType;
			}
			return token;
		},
		session: async ({ session, token }) => {
			if (token && session.user) {
				session.user.id = token.id;
				session.user.userType = token.userType;
			}
			return session;
		},
	},
};
