import { postSelect, prisma } from "@/lib/prisma"
import PostInterface from "@/interfaces/feed/post.interface"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../auth/[nextauth]/route"
import { ThirdUserProfileParamsInterface } from "@/interfaces/params/user/third-profile.interface"

export async function GET(req: NextRequest) {
  const session = await auth()
  const searchParams = req.nextUrl.searchParams as ThirdUserProfileParamsInterface
  const userId = searchParams.get("id") || session?.user?.id

  if(!userId) return NextResponse.json("ID do usuário não especificado", { status: 400 })

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: postSelect
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