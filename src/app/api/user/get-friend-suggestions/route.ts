import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function GET() {

  const idsOfFriends = new Promise(async(resolve, reject) => {
    const ids: number[] = []

    const res = await prisma.user.findMany({
      select: {
        friends: true
      }
    })
    
    res.map(userFriends => userFriends.friends.map(friend => ids.push(friend.id)))
 
    resolve(ids)
  })

  try {
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: await idsOfFriends as number[],
        }
      }
    })

    return NextResponse.json(suggestions)
  } catch (err) {
    return NextResponse.json({"error": err})
  }
}