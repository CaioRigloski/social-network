import { messageSelect, prisma, userSelect } from "@/lib/prisma"
import { auth } from "../../../auth/[nextauth]/route"
import { NextResponse } from "next/server"
import { GetChatParamsInterface } from "@/interfaces/params/user/chat/getChat.interface"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams as GetChatParamsInterface
    const chatId = searchParams.get('id')

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId
      },
      omit: {
        friendId: true,
        userId: true,
        createdAt: true,
      },
      include: {
        user: {
          select: userSelect
        },
        friend: {
          select: userSelect
        },
        messages: {
          select: messageSelect,
          orderBy: {
            createdAt: "asc"
          },
        }
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json(chat, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to get chat",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}