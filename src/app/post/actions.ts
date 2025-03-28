'use server'

import { commentSelect, likeSelect, prisma, userSelect } from "@/lib/prisma"
import { auth } from "../api/auth/[nextauth]/route"
import { deletePostSchema, newPostSchema } from "@/lib/zod"
import { z } from "zod"
import { randomUUID } from "crypto"
import { existsSync, unlinkSync, writeFileSync } from "fs"
import { imageFormats, path } from "@/lib/utils"
import PostInterface from "@/interfaces/post/post.interface"
import { mkdir } from "fs/promises"


export async function createNewPost(values: z.infer<typeof newPostSchema>) {
  const session = await auth()
  
  try {
    if (!existsSync(path.public_post_images)) {
      await mkdir(path.public_post_images, {recursive: true})
    }
    
    const UUID = randomUUID()
    values.picture && writeFileSync(`${path.public_post_images}/${UUID}.${imageFormats.posts}`, Buffer.from(values.picture.replace(/^data:image\/\w+;base64,/, ""), "base64"))

    const res = await prisma.post.create({
      data: {
        user: {
          connect: {id: session?.user?.id}
        },
        picture: values.picture && UUID.toString(),
        description: values.description,
      },
      include: {
        user: {
          select: userSelect
        },
        comments: {
          select: commentSelect
        },
        likes: {
          select: likeSelect
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    })
    
    return {
      id: res.id,
      user: res.user,
      description: res.description,
      picture: res.picture,
      comments: res.comments,
      commentsCount: res._count.comments,
      likes: res.likes,
      likesCount: res._count.likes
    } as PostInterface
  } catch (err) {
    throw new Error("Failed to create a new post. Please try again later.")
  }
}

export async function deletePost(values: z.infer<typeof deletePostSchema>) {
  const session = await auth()
  
  try {
    await prisma.post.delete({
      where: {
        id: values.postId,
        user: {
          id: session?.user?.id
        }
      }
    })
    
    values.imageName && unlinkSync(`${path.public_post_images}/${values.imageName}.${imageFormats.posts}`)
  } catch (err) {
    console.log(err)
  }
}