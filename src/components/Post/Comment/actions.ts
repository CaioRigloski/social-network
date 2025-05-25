'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import CommentInterface from "@/interfaces/post/comment/comment.interface"
import { prisma } from "@/lib/prisma"
import { deleteCommentSchema, editCommentSchema, newCommentSchema } from "@/lib/zod"
import { z } from "zod"

export async function createNewComment(values: z.infer<typeof newCommentSchema>) {
  const session = await auth()

  try {
    const res = await prisma.post.update({
      where: {
        id: values.postId
      },
      data: {
        comments: {
          create: {
            text: values.text,
            user: {
              connect: {
                id: session?.user?.id
              }
            }
          }
        }
      },
      select: {
        comments: {
          where: {
            user: {
              id: session?.user?.id,
            }
          },
          select: {
            id: true,
            text: true,
            user: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    })

    return {
      id: res.comments.at(0)?.id,
      text: res.comments.at(0)?.text,
      user: res.comments.at(0)?.user
    } as CommentInterface
  } catch (err) {
    console.log(err)
  }
}

export async function deleteComment(values: z.infer<typeof deleteCommentSchema>) {
  const session = await auth()

  try {
    await prisma.comment.delete({
      where: {
        id: values.commentId,
        user: {
          id: session?.user?.id
        }
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export async function editComment(values: z.infer<typeof editCommentSchema>) {
  const session = await auth()

  try {
    await prisma.comment.update({
      data: {
        text: values.text
      },
      where: {
        id: values.commentId,
        user: {
          id: session?.user?.id
        }
      }
    })
  } catch (err) {
    console.log(err)
  }
}