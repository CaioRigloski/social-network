'use server'

import { z } from "zod"
import { signInSchema } from "@/lib/zod"
import { signIn } from "@/app/api/auth/[nextauth]/route"

export async function checkCredentials(values: z.infer<typeof signInSchema>) {
  await signIn("credentials", {
    ...values,
    redirect: true,
    redirectTo: "/feed"
  })
}