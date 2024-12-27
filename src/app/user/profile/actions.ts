'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import { prisma } from "@/lib/prisma"
import { path } from "@/lib/utils"
import { newProfilePictureSchema, newUsernameSchema } from "@/lib/zod"
import { randomUUID } from "crypto"
import { writeFileSync } from "fs"
import { z } from "zod"

export async function changeProfilePicture(values: z.infer<typeof newProfilePictureSchema>) {
  const session = await auth()

  try {
    const UUID = randomUUID()
    writeFileSync(`${path.public_profile_images}/${UUID}.jpeg`, new Uint8Array(Buffer.from(values.picture.replace(/^data:image\/\w+;base64,/, ""), "base64")))

    await prisma.user.update({
      where: {
        id: session?.user?.id
      },
      data: {
        profilePicture: UUID
      }
    })
    
    return { fileName: UUID }
  } catch (err) {
    throw new Error("Error saving the image. Please contact the administrator.")
  }
}

export async function changeUsername(values: z.infer<typeof newUsernameSchema>) {
  const session = await auth()
  
  try {
    await prisma.user.update({
      where: {
        id: session?.user?.id
      },
      data: {
        username: values.newUsername
      }
    })
  } catch (err) {
    throw new Error("Error editing the username. Please contact the administrator.")
  }
}