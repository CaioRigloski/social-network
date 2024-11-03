import { prisma } from "@/lib/prisma"
import PostInterface from "@/interfaces/feed/post.interface"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../auth/[nextauth]/route"

export async function GET(req: NextRequest) {
  const session = await auth()
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get("id") || session?.user
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session?.user?.id
      },
      select: {
        id: true,
        username: true,
        posts: {
          select: {
            id: true,
            picture: true,
            comments: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                  }
                },
                text: true
              }
            },
            likes: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                  }
                }
              }
            },
            _count: {
              select: {
                likes: true
              }
            }
          }
        }
      }
    })
 
    if(user) {
      const modeledPosts: PostInterface[] = user?.posts.map(post => {
        return {
          id: post.id,
          user: {
            id: user.id,
            username: user.username
          },
          picture: post.picture,
          comments: post.comments,
          likes: post.likes,
          likesCount: post._count.likes
        }
      })
 
      return NextResponse.json( modeledPosts, { status: 200 } )
    }
  } catch (err) {
    throw new Error("User's posts retrieving error")
  }
}