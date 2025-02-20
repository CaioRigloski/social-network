import { messageSelect, prisma, userSelect } from "@/lib/prisma";
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
      omit: {
        friendId: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      },
      include: {
        user: {
          select: userSelect
        },
        friend: {
          select: userSelect
        },
        messages: {
          select: messageSelect
        }
      }
    })
    
    return NextResponse.json( chats, { status: 200 })
  } catch (err) {
    throw new Error('Chats retrieving error')
  }
}