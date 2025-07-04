'use server'

import { newFriendSchema } from '@/lib/zod'
import { z } from 'zod'
import { auth } from '@/app/api/auth/[nextauth]/route'
import { prisma } from '@/lib/prisma'


export async function sendFriendRequest(values: z.infer<typeof newFriendSchema>) {
  const session = await auth()
  
  try {
    await prisma.user.update({
      where: {
        id: session?.user?.id
      },
      data: {
        friendRequests: {
          connect: [{id: values.newFriendId}]
        }
      }
    })
    
    return { response: "Friend request sent" }
  } catch (err) {
    return { error: err }
  }
}