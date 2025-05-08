import { prisma, userSelect } from "@/lib/prisma"
import { auth } from "../../auth/[nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
 
  try {
    const res = await prisma.user.findUnique({
      where: {
        id: session?.user?.id
      },
      select: {
        friendRequestOf: {
          select: userSelect
        },
      }
    })
    return NextResponse.json( res?.friendRequestOf, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      {
        error: "Friend requests retrieving error",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}