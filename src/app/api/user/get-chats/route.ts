import { prisma } from "@/lib/prisma";
import { auth } from "../../auth/[nextauth]/route";
import { NextResponse } from "next/server";
import ChatInterface from "@/interfaces/chat/chat.interface";

export async function GET() {
  const session = await auth()

  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          {
            userId: session?.user?.id
          },
          {
            friendId: session?.user?.id
          }
        ]
      },
      include: {
        user: true,
        friend: true,
        messages: {
          select: {
            id: true,
            user: true,
            chatId: true,
            text: true,
            createdAt: true
          }
        },
      }
    })

    const modeledChats = chats.map(chat => {
      return {
        id: chat.id,
        friend: {
          id: chat.friend.id,
          username: chat.friend.username,
          profilePicture: chat.friend.profilePicture
        },
        user: {
          id: chat.user.id,
          username: chat.user.username,
          profilePicture: chat.user.profilePicture
        },
        messages: chat.messages
      }
    }) as ChatInterface[]

    return NextResponse.json( modeledChats, { status: 200 })
  } catch (err) {
    throw new Error('Chats retrieving error')
  }
}