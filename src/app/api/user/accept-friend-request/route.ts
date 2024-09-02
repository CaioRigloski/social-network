import AcceptFriendRequest from "@/interfaces/api/user/accept-friend-request.interface";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  const data: AcceptFriendRequest = await req.json()

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: data.userId
        },
        data: {
          friends: {
            connect: [{id: data.newFriendId}]
          }
        }
      }),
      prisma.user.update({
        where: {
          id: data.newFriendId
        },
        data: {
          friends: {
            connect: [{id : data.userId}]
          }
        }
      })
    ])
    return NextResponse.json({ status: 200 })
  } catch (err) {
    return NextResponse.json({ "error": err }, { status: 400 })
  }
}