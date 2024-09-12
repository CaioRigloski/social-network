import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const data: User = await req.json()

  try {
    await prisma.user.create({
      data: data
    })
  } catch (err) {
    console.log(err)
  }

  return NextResponse.json(data)
}