import { z } from "zod";

export const newPostSchema = z.object({
  picture: z.string()
})

export const newFriendSchema = z.object({
  userId: z.number(),
  newFriendId: z.number()
})