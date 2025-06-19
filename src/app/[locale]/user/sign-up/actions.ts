'use server'

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/zod";
import { redirect } from "next/navigation";
import { SIGN_IN_URL } from "@/lib/routes";

export async function createUser(values: z.infer<typeof signUpSchema>) {
  let redirectPath: string | null = null
  try {
    await prisma.user.create({
      data: values
    })
    redirectPath = SIGN_IN_URL + "/?status=created"
  } catch (err) {
    console.log(err)
  } finally {
    if(redirectPath) {
      redirect(redirectPath)
    }
  }
}