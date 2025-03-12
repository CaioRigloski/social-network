'use server'

import { auth } from '@/app/api/auth/[nextauth]/route'
import { messageSelect, prisma } from '@/lib/prisma'
import { deleteChatSchema, deleteMessageSchema, editMessageSchema, newChatSchema, updateChatSchema } from '@/lib/zod'
import { z } from 'zod'

export default async function updateChat(values: z.infer<typeof updateChatSchema>) {
  const session = await auth()

  if (!session?.user?.id || !values.friendId) {
    throw new Error('User ID or Friend ID is missing');
  }
  
  try {
    const [sortedUserId, sortedFriendId] = [session?.user?.id, values.friendId].sort()
    
    const chat = await prisma.chat.update({
      where: {
        userId_friendId: {
          userId: sortedUserId,
          friendId: sortedFriendId
        }
      },
      data: {
        updatedAt: new Date(),
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
      include: {
        user: true,
        friend: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
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

export async function createChat(values: z.infer<typeof newChatSchema>) {
  const session = await auth()

  if (!session?.user?.id || !values.friendId) {
    throw new Error('Friend ID is missing');
  }
  
  try {
    const [sortedUserId, sortedFriendId] = [session?.user?.id, values.friendId].sort()

    const chat = await prisma.chat.create({
      data: {
        user: {
          connect: {
            id: sortedUserId
          }
        },
        friend: {
          connect: {
            id: sortedFriendId
          }
        }
      },
      include: {
        user: true,
        friend: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
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

export async function deleteChat(values: z.infer<typeof deleteChatSchema>) {
  const session = await auth()

  try {
    await prisma.chat.delete({
      where: {
        id: values.chatId
      }
    })
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