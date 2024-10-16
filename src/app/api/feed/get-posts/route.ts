import PostInterface from "@/interfaces/feed/post.interface"
import UserInterface from "@/interfaces/feed/user.interface"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "../../auth/[nextauth]/route"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await auth()

  try {
    const friendsResult = await fetch(process.env.url + "/api/user/get-friends", { cache: "no-store", headers: req.headers })
    const friendsArray: UserInterface[] = await friendsResult.json()
    const friendsIds = friendsArray.map(friend => friend.id)
    
    if(session?.user?.id) {
      friendsIds.push(session.user.id)
    }
 
    const posts = await prisma.post.findMany({
      where: {
        user: {
          id: {
            in: friendsIds
          }
        }
      },
      omit: {
        userId: true
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        comments: {
          select: {
            id: true,
            text: true,
            user: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              }
            }
          }
        }
      }
    })

    const modeledPosts: PostInterface[] = posts.map(post => {
      return {
        id: post.id,
        user: post.user,
        picture: post.picture,
        comments: post.comments
      }
    })

    return NextResponse.json( modeledPosts ) 
  } catch (err) {
    throw new Error("Posts retrieving error")
  }
}