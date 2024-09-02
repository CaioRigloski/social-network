import { z } from "zod";
import { signInSchema } from "./sign-in.types";

export async function checkCredentials(values: z.infer<typeof signInSchema>) {
  try {
    await fetch("/api/user/check-credentials", {
      method: "GET",
      body: JSON.stringify(values)
    })
  } catch (err) {
    console.log(err)
  }}