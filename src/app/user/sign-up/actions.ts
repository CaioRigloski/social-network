'use server'

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/zod";

export async function createUser(values: z.infer<typeof signUpSchema>) {
  try {
    await prisma.user.create({
      data: values
    })
  } catch (err) {
    console.log(err)
  }
}