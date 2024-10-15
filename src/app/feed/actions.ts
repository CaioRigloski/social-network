'use server'

import { newFriendSchema } from '@/lib/zod'
import { z } from 'zod'
import { auth, signOut } from '../api/auth/[nextauth]/route'
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

export async function acceptFriendRequest(values: z.infer<typeof newFriendSchema>) {
  const session = await auth()

  try {
    const res = await prisma.user.update({
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
    return { response: "Friend request accepted" }
  } catch (err) {
    return { error: err }
  }
}

export async function signOutAction() {
  await signOut()
}