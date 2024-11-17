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
    profilePicture?: string | null
    email?: string | null | undefined
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User
  }
}

export const { handlers: { GET, POST }, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "username" },
        password: { label: "password" , type: "password" }
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
              username: user.username,
              profilePicture: user.profilePicture
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
    async session({ session, token, user, trigger, newSession}) {
      // Attach the user information to the session
      if (token.user) {
        // @ts-ignore
        session.user = token.user
      }

      return session;
    },
    async jwt({ token, trigger, user, session }) {
      if (trigger === "signIn" && user || trigger === "update" && user) {
        token.user = {id: user.id, username: user.username, profilePicture: user.profilePicture}
      }
  
      /* if (trigger === "update" && session?.user?.profilePicture) {
        token.user.profilePicture = session.user.profilePicture
      } */

      return token
    },
  },
})