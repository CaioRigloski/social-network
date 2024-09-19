import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true
      }
    })
    return NextResponse.json( posts )
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 })
  }
}