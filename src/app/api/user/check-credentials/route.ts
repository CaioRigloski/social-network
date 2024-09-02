import User from "@/interfaces/feed/user.interface";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient

export async function GET(req: Request) {
  const user: User = await req.json()
  try {
    await prisma.user.findUnique({
      where: {
        username: user.username,
        password: user.password
      }
    })
  }
}