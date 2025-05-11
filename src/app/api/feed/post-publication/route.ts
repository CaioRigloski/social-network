import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request){
  const data = await req.json()

  try {
    await prisma.post.create({
      data: data
    })
    return NextResponse.json( data )
  } catch (err) {
    return NextResponse.json(
      {
        error: "Post publication error",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}