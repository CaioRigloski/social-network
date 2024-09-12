import { z } from "zod"

export const signUpSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string()
})

export const signInSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string()
})

export const newPostSchema = z.object({
  picture: z.string()
})

export const newFriendSchema = z.object({
  userId: z.string(),
  newFriendId: z.string()
})