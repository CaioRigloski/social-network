import { messageSelect, prisma, userSelect } from "@/lib/prisma"
import { auth } from "../../../auth/[nextauth]/route"
import { NextResponse } from "next/server"


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