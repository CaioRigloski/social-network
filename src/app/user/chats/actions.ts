'use server'

import { auth } from '@/app/api/auth/[nextauth]/route'
import { prisma } from '@/lib/prisma'
import { messageSchema, chatSchema } from '@/lib/zod'
import { z } from 'zod'

export default async function createOrUpdateChat(values: z.infer<typeof messageSchema>) {
  const session = await auth()

  if (!session?.user?.id || !values.friendId) {
    throw new Error('User ID or Friend ID is missing');
  }

  try {
   const chat = await prisma.chat.upsert({
    where: {
      userId_friendId: {
        userId: session?.user?.id,
        friendId: values.friendId
      }
    },
    create: {
      user: {
        connect: {
          id: session?.user?.id
        }
      },
      friend: {
        connect: {
          id: values.friendId
        }
      },
      messages: {
        create: {
          text: values.text,
          user: {
            connect: {
              id: session?.user?.id
            }
          }
        }
      }
    },
    update: {
      messages: {
        create: {
          text: values.text,
          user: {
            connect: {
              id: session?.user?.id
            }
          }
        }
      }
    }
   })
   return chat.id
  } catch (err) {
    console.log(err)
  }
}

export async function getChats(values: z.infer<typeof chatSchema>) {
  const session = await auth()

  try {
    const chats = await prisma.chat.findUnique({
      where: {
        id: values.rommId
      },
      select: {
        messages: true
      }
    })
    
    return chats
  } catch (err) {
    console.log(err)
  }
}