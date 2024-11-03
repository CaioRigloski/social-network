import { prisma } from "@/lib/prisma"
import { auth } from "../../auth/[nextauth]/route"
import { NextResponse } from "next/server"
import UserInterface from "@/interfaces/feed/user.interface"


export async function GET() {
  const session = await auth()

  // API route "/feed/get-posts" needs to do a fetch and be forced to pass the headers necessary for credentials retrieving.
  if(!session?.user) {
    throw new Error("Session is null")
  }
  
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
    
    return NextResponse.json( friends, { status: 200 } )
  } catch (err) {
    throw new Error("User's friends retrieving error")
  }
}