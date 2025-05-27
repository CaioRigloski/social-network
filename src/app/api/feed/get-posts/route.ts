import PostInterface from "@/interfaces/post/post.interface"
import { commentSelect, likeSelect, prisma, userSelect } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "../../auth/[nextauth]/route"

export async function GET(req: Request) {
  const session = await auth()

  try {
    const posts = await prisma.post.findMany({
      where: {
        user: {
          OR: [
            {
              friends: {
                every: { id: session?.user.id }
              }
            },
            {
              friendOf: {
                every: { id: session?.user.id }
              }
            },
            {
              id: session?.user.id
            }
          ],
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
        likesCount: post._count.likes,
        createdAt: post.createdAt
      }
    }) as PostInterface[]
 
    return NextResponse.json( modeledPosts ) 
  } catch (err) {
    return NextResponse.json(
      {
        error: "Posts retrieving error",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}