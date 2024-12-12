import { prisma } from "@/lib/prisma";
import { auth } from "../../auth/[nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth()

  try {
    const res = await prisma.chat.findMany({
      where: {
        user: {
          id: session?.user?.id
        }
      },
      include: {
        user: true,
        friend: true,
        messages: true
      }
    })

    return NextResponse.json( res, { status: 200 })
  } catch (err) {
    throw new Error('Chats retrieving error')
  }
}