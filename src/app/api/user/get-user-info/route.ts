import UserInterface from "@/interfaces/feed/user.interface";
import { UserParamsInterface } from "@/interfaces/params/user/user.interface";
import { prisma, userSelect } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams as UserParamsInterface
  const userId = searchParams.get("id")
  console.log(userId)

  if(!userId) return NextResponse.json("ID do usuário não especificado", { status: 400 })
    
  try {
    if (userId) {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId
        },
        select: userSelect
      })

      return NextResponse.json(user, { status: 200 })
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "User retrieving error",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}