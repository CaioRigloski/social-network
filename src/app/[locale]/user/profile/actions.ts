'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import { prisma } from "@/lib/prisma"
import { path as appPaths } from "@/lib/utils"
import { newProfilePictureSchema, newUsernameSchema } from "@/lib/zod"
import { randomUUID } from "crypto"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import path from "path"
import { z } from "zod"

export async function changeProfilePicture(values: z.infer<typeof newProfilePictureSchema>) {
  const session = await auth()

  try {
    const profileDir = path.join(process.cwd(), appPaths.public_profile_images)

    if (!existsSync(profileDir)) {
      mkdirSync(profileDir, { recursive: true })
    }

    const UUID = randomUUID()
    writeFileSync(`${appPaths.public_profile_images}/${UUID}.jpeg`, new Uint8Array(Buffer.from(values.picture.replace(/^data:image\/\w+;base64,/, ""), "base64")))

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
    console.log(err)
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