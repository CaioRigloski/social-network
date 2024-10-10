import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "../../auth/[nextauth]/route"


export async function GET() {
  const session = await auth()

  const idsOfFriendsAndRequests = async() => {
    const ids: string[] = []

    const res = await prisma.user.findUnique({
      where: {
        id: session?.user?.id
      },
      select: {
        friends: true,
        friendOf: true,
        friendRequestOf: true,
        friendRequests: true
      }
    })

    res?.friends.map(userFriends => ids.push(userFriends.id))
    res?.friendOf.map(userFriendOf => ids.push(userFriendOf.id))
    res?.friendRequests.map(userFriendRequests => ids.push(userFriendRequests.id))
    res?.friendRequestOf.map(userFriendRequestsOf => ids.push(userFriendRequestsOf.id))
 
    return ids
  }
  

  try {
    const suggestions = await prisma.user.findMany({
      omit: {
        password: true
      },
      where: {
        id: {
          notIn: await idsOfFriendsAndRequests(),
          not: session?.user?.id,
        }
      }
    })

    return NextResponse.json( suggestions )
  } catch (err) {
    throw new Error("Friend suggestions retrieving error")

  }
}