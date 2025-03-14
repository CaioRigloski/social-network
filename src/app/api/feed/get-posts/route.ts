import PostInterface from "@/interfaces/post/post.interface"
import { commentSelect, likeSelect, prisma, userSelect } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "../../auth/[nextauth]/route"
import { GetPostsParamsInterface } from "@/interfaces/params/feed/getPosts.interface"


export async function GET(req: Request) {
  const session = await auth()

  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams as GetPostsParamsInterface
    const friendsIds = searchParams.get('friendsIds')?.split(',') || []

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
      orderBy: {
        createdAt: "desc"
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
            comments: true,
            likes: true
          }
        }
      }
    })

    const modeledPosts = posts.map(post => {
      return {
        id: post.id,
        user: {
          id: post.user.id,
          username: post.user.username,
          profilePicture: post.user.profilePicture
        },
        description: post.description,
        picture: post.picture,
        comments: post.comments,
        commentsCount: post._count.comments,
        likes: post.likes,
        likesCount: post._count.likes
      }
    }) as PostInterface[]
 
    return NextResponse.json( modeledPosts ) 
  } catch (err) {
    console.log(err)
    throw new Error("Posts retrieving error")
  }
}