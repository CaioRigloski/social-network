import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "../../auth/[nextauth]/route"


export async function GET() {
    const idsOfFriends = new Promise(async(resolve, reject) => {
    const ids: string[] = []
    
    const res = await prisma.user.findMany({
      select: {
        friends: true
      }
    })
    
    res.map(userFriends => userFriends.friends.map(friend => ids.push(friend.id)))
    
    resolve(ids)
  })
  const session = await auth()

  try {
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: await idsOfFriends as string[],
          not: session?.user?.id
        }
      }
    })
    return NextResponse.json(suggestions)
  } catch (err) {
    return NextResponse.json({"error": err})
  }
}