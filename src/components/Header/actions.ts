'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import { prisma } from "@/lib/prisma"
import { newFriendSchema } from "@/lib/zod"
import { z } from "zod"

export async function acceptFriendRequest(values: z.infer<typeof newFriendSchema>) {
  const session = await auth()

  try {
    const user = await prisma.user.update({
      where: {
        id: session?.user?.id
      },
      data: {
        friends: {
          connect: [{id: values.newFriendId}]
        },
        friendRequestOf: {
          disconnect: [{id: values.newFriendId}]
        }
      }
    })
    return { response: "Friend request accepted", user: user }
  } catch (err) {
    return { error: err }
  }
}