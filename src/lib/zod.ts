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
  picture: z.any().refine(file => "image/".includes(file))
})

export const newFriendSchema = z.object({
  newFriendId: z.string()
})

export const newProfilePictureSchema = z.object({
  picture: z.any().refine(file => "image/".includes(file))
})