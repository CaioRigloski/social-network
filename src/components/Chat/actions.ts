'use server'

import { auth } from '@/app/api/auth/[nextauth]/route'
import { messageSelect, prisma } from '@/lib/prisma'
import { newMessageSchema, chatSchema, deleteMessageSchema, editMessageSchema } from '@/lib/zod'
import { z } from 'zod'

export default async function createOrUpdateChat(values: z.infer<typeof newMessageSchema>) {
  const session = await auth()

  if (!session?.user?.id || !values.friendId) {
    throw new Error('User ID or Friend ID is missing');
  }
  
  try {
    const [sortedUserId, sortedFriendId] = [session?.user?.id, values.friendId].sort()

    const chat = await prisma.chat.upsert({
      where: {
        userId_friendId: {
          userId: sortedUserId,
          friendId: sortedFriendId
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
        ...(values.text ? {
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
        } : {})
      },
      update: {
        updatedAt: new Date(),
        ...(values.text ? {
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
        } : {})
      },
      include: {
        user: true,
        friend: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            ...messageSelect
          }
        },
      },
    })
    
    return chat
  } catch (err) {
    console.log(err)
  }
}

export async function getChats(values: z.infer<typeof chatSchema>) {
  const session = await auth()

  try {
    const chats = await prisma.chat.findUnique({
      where: {
        id: values.roomId
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

export async function deleteMessage(values: z.infer<typeof deleteMessageSchema>) {
  const session = await auth()

  try {
    const message = await prisma.message.delete({
      where: {
        id: values.messageId
      }
    })
    
    return message
  } catch (err) {
    console.log(err)
  }
}

export async function editMessage(values: z.infer<typeof editMessageSchema>) {
  const session = await auth()

  try {
    const message = await prisma.message.update({
      where: {
        id: values.messageId
      },
      data: {
        text: values.text
      }
    })
    
    return message
  } catch (err) {
    console.log(err)
  }
}