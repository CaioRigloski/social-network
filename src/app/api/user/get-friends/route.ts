import { prisma } from "@/lib/prisma"
import { auth } from "../../auth/[nextauth]/route"
import { NextResponse } from "next/server"
import UserInterface from "@/interfaces/feed/user.interface"


export async function GET() {
  const session = await auth()
  
  try {
    const friends: UserInterface[] = []

    const res = await prisma.user.findMany({
      where: {
        id: session?.user?.id
      },
      select: {
        friends: {
          select: {
            id: true,
            username: true,
            createdAt: true
          }
        },
        friendOf: {
          select: {
            id: true,
            username: true,
            createdAt: true
          }
        }
      }
    })

    res.map(select => {
      if(select.friends.length !== 0) {
        select.friends.map(friend => friends.push(friend))
      }

      if(select.friendOf.length !== 0) {
        select.friendOf.map(friend => friends.push(friend))
      }
    })

    return NextResponse.json( friends )
  } catch (err) {
    return NextResponse.json({ error: err})
  }
}