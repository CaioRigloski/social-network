import { NextResponse } from "next/server"
import { PrismaClient  } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request){
  const data = await req.json()

  try {
    await prisma.post.create({
      data: data
    })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({error: err}, {status: 500})
  }
}