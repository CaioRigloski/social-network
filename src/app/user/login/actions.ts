'use server'

import { z } from "zod"
import { loginSchema } from "@/lib/zod"
import { signIn } from "@/app/api/auth/[nextauth]/route"

export async function checkCredentials(values: z.infer<typeof loginSchema>) {
  try {
    await signIn("credentials", {
      ...values,
      redirect: false,
    })
    
    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      message: "Incorrect username or password"
    }
  }
}