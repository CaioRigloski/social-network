import { checkUserAuthorization } from "@/lib/dal"
import { messageSelect, prisma, userSelect } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET(req: Request, context: { params: { userId: string } }) {
  const userId = context.params.userId

  const { authorized, response } = await checkUserAuthorization(userId)
  
  if (!authorized) return response

  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          {
            userId: userId
          },
          {
            friendId: userId
          }
        ]
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
          take: 1,
          orderBy: {
            createdAt: "desc"
          },
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })
    
    return NextResponse.json( chats, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to get chats",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}