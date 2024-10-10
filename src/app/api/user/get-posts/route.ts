'use server'

import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get("id")

  try {
    const res = await prisma.user.findUnique({
      where: {
        id: id as string
      },
      select: {
        posts: true
      }
    })
  
    return NextResponse.json( res?.posts )
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 400 })
  }
}