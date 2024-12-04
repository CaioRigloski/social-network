'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import LikeInterface from "@/interfaces/feed/like.interface"
import { prisma } from "@/lib/prisma"
import { newLikeSchema, unlikeSchema } from "@/lib/zod"
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
      },
      select: {
        likes: {
          where: {
            user: {
              id: session?.user?.id
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        },
        user: true
      }
    })

    return {
      id: res.likes[0].id,
      user: res.user
    } as LikeInterface
  } catch (err) {
    console.log(err)
  }
}

export async function unlike(values: z.infer<typeof unlikeSchema>) {
  const session = await auth()

  try {
    await prisma.post.update({
      where: {
        id: values.postId
      },
      data: {
        likes: {
          delete: {
            id: values.likeId,
            user: {
              id: session?.user?.id
            }
          }
        }
      }
    })
  } catch (err) {
    console.log(err)
  }
}