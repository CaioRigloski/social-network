'use server'

import { z } from "zod";
import { signUpSchema } from "./sign-up.types";
import { NextResponse } from "next/server";

export async function createUser(values: z.infer<typeof signUpSchema>) {
  try {
    const response = await fetch("http:\\localhost:3000/api/user/sign-up", {
      method: "POST",
      body: JSON.stringify(values)
    })
    NextResponse.json({ status: 200 })
  } catch (err) {
    NextResponse.json({ status: 400 })
  }
}