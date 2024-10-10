import PostInterface from "@/interfaces/feed/post.interface"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      omit: {
        userId: true
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    const modeledPosts: PostInterface[] = posts.map(post => {
      return {
        id: post.id,
        user: post.user,
        picture: post.picture
      }
    })

    return NextResponse.json( modeledPosts ) 
  } catch (err) {
    throw new Error("Posts retrieving error")
  }
}