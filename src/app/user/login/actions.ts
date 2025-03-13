'use server'

import { z } from "zod"
import { loginSchema } from "@/lib/zod"
import { signIn } from "@/app/api/auth/[nextauth]/route"

export async function checkCredentials(values: z.infer<typeof loginSchema>) {
 await signIn("credentials", {
    ...values,
    redirect: true,
    redirectTo: "/feed",
  })
}