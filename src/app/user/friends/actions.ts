'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import { prisma } from "@/lib/prisma"
import { removeFriendSchema } from "@/lib/zod"
import { z } from "zod"

export default async function removeFriend(values: z.infer<typeof removeFriendSchema>) {
  const session = await auth()

  try {
    await prisma.user.update({
      data: {
        friends: {
          disconnect: {
            id: values.friendId
          }
        },
        friendOf: {
          disconnect: {
            id: values.friendId
          }
        }
      }, 
      where: {
        id: session?.user?.id
      }
    })
  } catch (err) {
    throw new Error("Error removing a friend. Please contact the administrator.")
  }
}