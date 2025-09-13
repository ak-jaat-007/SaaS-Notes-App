import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: "ADMIN" | "MEMBER"
      tenant: {
        id: string
        slug: string
        plan: "FREE" | "PRO"
      }
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    role: "ADMIN" | "MEMBER"
    tenant: {
      id: string
      slug: string
      plan: "FREE" | "PRO"
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "MEMBER"
    tenant: {
      id: string
      slug: string
      plan: "FREE" | "PRO"
    }
  }
}
