import PostInterface from "@/interfaces/feed/post.interface"
import UserInterface from "@/interfaces/feed/user.interface"
import { commentSelect, likeSelect, prisma, userSelect } from "@/lib/prisma"
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
          select: userSelect
        },
        comments: {
          select: commentSelect,
          orderBy: {
            createdAt: "desc"
          }
        },
        likes: {
          select: likeSelect
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    const modeledPosts: PostInterface[] = posts.map(post => {
      return {
        id: post.id,
        user: {
          id: post.user.id,
          username: post.user.username
        },
        picture: post.picture,
        comments: post.comments,
        likes: post.likes,
        likesCount: post._count.likes
      }
    })
 
    return NextResponse.json( modeledPosts ) 
  } catch (err) {
    console.log(err)
    throw new Error("Posts retrieving error")
  }
}