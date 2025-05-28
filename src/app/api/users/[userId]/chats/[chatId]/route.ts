import { messageSelect, prisma, userSelect } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkUserAuthorization } from "@/lib/dal"

export async function GET(req: Request, context: { params: { userId: string, chatId: string } }) {
  const userId = context.params.userId
  const chatId = context.params.chatId

  const { authorized, response } = await checkUserAuthorization(userId)

  if (!authorized) return response

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
  }

  try {
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