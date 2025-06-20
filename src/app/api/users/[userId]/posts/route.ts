import { userPostsSelect, prisma } from "@/lib/prisma"
import PostInterface from "@/interfaces/post/post.interface"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../auth/[nextauth]/route"

export async function GET(req: NextRequest, context: { params: { userId: string } }) {
  const session = await auth()
  const userId = context.params.userId || session?.user?.id

  if(!userId) return NextResponse.json("User ID not specified", { status: 400 })

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: userPostsSelect
    })
    
    if(user) {
      const modeledPosts: PostInterface[] = user?.posts.map(post => {
        return {
          id: post.id,
          user: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture
          },
          description: post.description,
          picture: post.picture || "",
          comments: post.comments,
          commentsCount: post._count.comments,
          likes: post.likes,
          likesCount: post._count.likes,
          createdAt: post.createdAt
        }
      })
 
      return NextResponse.json( modeledPosts, { status: 200 } )
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "Error retrieving user's posts",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}