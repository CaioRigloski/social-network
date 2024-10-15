'use server'

import PostInterface from "@/interfaces/feed/post.interface"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get("id")

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id as string
      },
      select: {
        id: true,
        username: true,
        posts: {
          omit: {
            userId: true
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
          picture: post.picture
        }
      })
      return NextResponse.json( modeledPosts )
    }
  } catch (err) {
    throw new Error("User's posts retrieving error")
  }
}