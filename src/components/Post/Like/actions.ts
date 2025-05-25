'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import LikeInterface from "@/interfaces/post/like/like.interface"
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
          select: {
            id: true,
            user: true
          },
          take: 1
        }
      }
    })

    return {
      id: res.likes.at(0)?.id,
      user: res.likes.at(0)?.user
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