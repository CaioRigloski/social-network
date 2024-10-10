import NextAuth, { DefaultSession, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { signInSchema } from "@/lib/zod"


declare module "next-auth" {
  interface Session {
    user: DefaultSession['user']
  }

  interface User {
    id?: string | undefined
    username: string | undefined
    email?: string | null | undefined
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User
  }
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {}
      },
      authorize: async (credentials) => {
        try {
          const { username, password } = await signInSchema.parseAsync(credentials)

          const user = await prisma.user.findFirst({
            where: {
              username: username,
              password: password
            }
          })

          if(user) {
            return {
              id: user.id.toString(),
              username: user.username
            }
          } else {
            throw new Error("User not found.")
          }
        } catch (err) {
          console.log(err)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Attach the user information to the session
      if (token.user) {
        // @ts-ignore
        session.user = token.user
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = {id: user.id as string, username: user.username as string};
      }
      return token;
    },
  },
})