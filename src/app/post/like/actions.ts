import { auth } from "@/app/api/auth/[nextauth]/route"
import { prisma } from "@/lib/prisma"
import { newLikeSchema } from "@/lib/zod"
import { z } from "zod"

export async function createNewLike(values: z.infer<typeof newLikeSchema>) {
  const session = await auth()

  try {
    const res = await prisma.post.update({
      where: {
        id: values.postId
      },
      data: {
        likes: {
          create: {
            user: {
              connect: {
                id: session?.user?.id
              }
            }
          }
        }
      }
    })
  } catch (err) {
    console.log(err)
  }
}