import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true
      }
    })
    return NextResponse.json(posts)
  } catch (err) {
    return NextResponse.json({error: err}, {status: 500})
  }
}