import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const data = await req.json()

  try {
    await prisma.user.create({
      data: data
    })
  } catch (err) {
    console.log(err)
  }

  return NextResponse.json(data)
}