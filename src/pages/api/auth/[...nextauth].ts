import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // --- START OF DEBUG LOGS ---
        console.log("--- AUTHORIZE FUNCTION TRIGGERED ---");
        if (!credentials?.email || !credentials.password) {
          console.log("Missing email or password.");
          return null;
        }
        console.log("Attempting login for:", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("User not found in database.");
          console.log("--- AUTHORIZE FUNCTION END ---");
          return null;
        }
        console.log("User found in database:", user.email);

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log("Password comparison FAILED for user:", user.email);
          console.log("--- AUTHORIZE FUNCTION END ---");
          return null; // This is where the "Invalid Credentials" error comes from
        }

        console.log("Password comparison SUCCEEDED for user:", user.email);
        console.log("--- AUTHORIZE FUNCTION END ---");
        // --- END OF DEBUG LOGS ---

        // This object is passed to the 'jwt' callback on sign-in
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          tenant: await prisma.tenant.findUnique({ where: { id: user.tenantId! } }),
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { tenant: true },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.tenant = dbUser.tenant
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}

export default NextAuth(authOptions)