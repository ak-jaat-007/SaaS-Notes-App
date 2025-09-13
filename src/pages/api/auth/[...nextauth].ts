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
      // The 'authorize' function is correct and needs no changes.
      // It correctly fetches the user and tenant on initial login.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        })

        if (!user || !user.tenant) return null

        const isPasswordValid =
          user.password === credentials.password ||
          (await bcrypt.compare(credentials.password, user.password))

        if (!isPasswordValid) return null

        // This object is passed to the 'jwt' callback on sign-in
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          // We pass the tenant here so the initial JWT can be formed
          tenant: user.tenant,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // ✨ --- KEY CHANGES ARE HERE --- ✨
  callbacks: {
    // 1. The JWT callback now only persists the user's unique ID to the token.
    //    We no longer store the entire tenant object here to avoid stale data.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },

    // 2. The session callback uses the ID from the token to fetch fresh data
    //    from the database on EVERY session check.
    async session({ session, token }) {
      if (token.id && session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { tenant: true },
        })

        if (dbUser) {
          // Overwrite the session user with the latest data
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          // This tenant object is now always fresh from the database
          session.user.tenant = dbUser.tenant
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // It's good practice to always include the secret
  pages: {
    signIn: "/login",
  },
}

export default NextAuth(authOptions)