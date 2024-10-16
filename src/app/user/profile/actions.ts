'use server'

import { auth } from "@/app/api/auth/[nextauth]/route"
import { prisma } from "@/lib/prisma"
import { path } from "@/lib/utils"
import { newProfilePictureSchema } from "@/lib/zod"
import { randomUUID } from "crypto"
import { writeFileSync } from "fs"
import { z } from "zod"

export async function changeProfilePicture(values: z.infer<typeof newProfilePictureSchema>) {
  const session = await auth()

  try {
    const UUID = randomUUID()
    writeFileSync(`./public/images/${path.profile}/${UUID}.jpeg`, Buffer.from(values.picture.replace(/^data:image\/\w+;base64,/, ""), "base64"))

    await prisma.user.update({
      where: {
        id: session?.user?.id
      },
      data: {
        profilePicture: UUID
      }
    })
    
    return { fileName: UUID}
  } catch (err) {
    throw new Error("Error saving the image. Please contact the administrator.")
  }
}