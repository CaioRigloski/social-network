import UserInterface from "@/interfaces/feed/user.interface";
import { UserParamsInterface } from "@/interfaces/params/user/user.interface";
import { prisma } from "@/lib/prisma";
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
        select: {
          id: true,
          username: true,
          profilePicture: true
        }
      })

      return NextResponse.json(user, { status: 200 })
    }
  } catch (err) {
    throw new Error("User retrieving error")
  }
}