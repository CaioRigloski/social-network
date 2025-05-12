import { GetSearchParamsInterface } from "@/interfaces/params/search/getSearch.interface";
import SearchResultInterface from "@/interfaces/search/searchResult/searchResult.interface";
import { postSelect, prisma, userSelect } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams as GetSearchParamsInterface
    const query = searchParams.get('query')
    const includeUsers = searchParams.get("users") === "true"
    const includePosts = searchParams.get("posts") === "true"
    const results: SearchResultInterface = {}
    
    if(includeUsers) {
      results.users = await prisma.user.findMany({
        where: {
          username: {
            startsWith: query || ""
          }
        },
        select: userSelect
      })
    }
    
    if(includePosts) {
      const rawPosts = await prisma.post.findMany({
        where: {
          OR: [
            {
              description: {
                contains: query || "",
              },
            },
            {
              user: {
                username: {
                  startsWith: query || "",
                },
              },
            },
            {
              labels: {
                some: {
                  name: {
                    contains: query || ""
                  }
                }
              }
            }
          ],
        },
        select: postSelect,
      })
      
      results.posts = rawPosts.map(post => ({
        ...post,
        picture: post.picture || "",
        commentsCount: post._count?.comments || 0,
        likesCount: post._count?.likes || 0,
      }))
    }
    
    return NextResponse.json(results)
  } catch (err) {
     return NextResponse.json(
      {
        error: "Search results retrieving error",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}