import { prisma, userSelect } from "@/lib/prisma"
import { auth } from "../../../auth/[nextauth]/route"
import { NextResponse } from "next/server"
import { checkUserAuthorization } from "@/lib/dal"

export async function GET(req: Request, context: { params: { userId: string } }) {
  const userId = context.params.userId

  const { authorized, response } = await checkUserAuthorization(userId)
    
    if (!authorized) return response
 
  try {
    const res = await prisma.user.findUnique({
      where: {
        id: userId
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