import { friendSuggestionsSelect, prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "../../../auth/[nextauth]/route"


export async function GET() {
  const session = await auth()

  const idsOfFriendsAndRequests = async() => {
    const ids: string[] = []

    const res = await prisma.user.findUnique({
      where: {
        id: session?.user?.id
      },
      select: friendSuggestionsSelect
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
    return NextResponse.json(
      {
        error: "Friend suggestions retrieving error",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}