'use server'

import { newFriendSchema, newPostSchema } from '@/lib/zod'
import { z } from 'zod'
import { auth, signOut } from '../api/auth/[nextauth]/route'
import { prisma } from '@/lib/prisma'


export async function createNewPost(values: z.infer<typeof newPostSchema>) {
  const session = await auth()
  const imageBuffer = Buffer.from(btoa(values.picture))

  try {
    const res = await prisma.post.create({
      data: {
        user: {
          connect: {id: session?.user?.id}
        },
        picture: imageBuffer
      }
    })
    console.log(res)
  } catch (err) {
    console.log(err)
  }
}

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
    
    return { response: "Friend request sent"}
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
    return { response: "Friend request accepted"}
  } catch (err) {
    return { error: err }
  }
}

export async function signOutAction() {
  await signOut()
}