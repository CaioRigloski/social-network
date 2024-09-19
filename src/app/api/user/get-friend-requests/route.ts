import { prisma } from "@/lib/prisma"
import { auth } from "../../auth/[nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()

  try {
    const res = await prisma.user.findUnique({
      where: {
        id: session?.user?.id
      },
      select: {
        friendRequestOf: {
          select: {
            id: true,
            username: true
          }
        },
      }
    })
    return NextResponse.json( res?.friendRequestOf, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 400 })
  }
}