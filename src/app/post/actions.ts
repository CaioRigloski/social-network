'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "../api/auth/[nextauth]/route"
import { deletePostSchema, newPostSchema } from "@/lib/zod"
import { z } from "zod"
import { randomUUID } from "crypto"
import { existsSync, unlinkSync, writeFileSync } from "fs"
import { imageFormats, path } from "@/lib/utils"
import PostInterface from "@/interfaces/feed/post.interface"
import { mkdir } from "fs/promises"


export async function createNewPost(values: z.infer<typeof newPostSchema>) {
  const session = await auth()
  
  try {
    if (!existsSync(path.public_post_images)) {
      await mkdir(path.public_post_images, {recursive: true})
    }

    const UUID = randomUUID()
    writeFileSync(`${path.public_post_images}/${UUID}.${imageFormats.posts}`, Buffer.from(values.picture.replace(/^data:image\/\w+;base64,/, ""), "base64"))

    const res = await prisma.post.create({
      data: {
        user: {
          connect: {id: session?.user?.id}
        },
        picture: UUID.toString()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })
    
    return {
      id: res.id,
      user: res.user,
      picture: res.picture
    } as PostInterface
  } catch (err) {
    console.log(err)
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
    unlinkSync(`${path.public_post_images}/${values.imageName}.${imageFormats.posts}`)
  } catch (err) {
    console.log(err)
  }
}