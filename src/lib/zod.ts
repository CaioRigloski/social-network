import { z } from "zod"

export const signUpSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string()
})

export const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string()
})

export const newPostSchema = z.object({
  picture: z.any().refine(file => "image/".includes(file)),
  description: z.string().max(500, "Description must have a maximum 500 characters").optional()
})

export const deletePostSchema = z.object({
  postId: z.string(),
  imageName: z.string()
})

export const newCommentSchema = z.object({
  postId: z.string(),
  text: z.string().max(500, "Description must have a maximum 500 characters")
})

export const deleteCommentSchema = z.object({
  commentId: z.string()
})

export const editCommentSchema = z.object({
  commentId: z.string(),
  text: z.string().max(500, "Description must have a maximum 500 characters")
})

export const newLikeSchema = z.object({
  postId: z.string()
})

export const unlikeSchema = z.object({
  postId: z.string(),
  likeId: z.string()
})

export const newFriendSchema = z.object({
  newFriendId: z.string()
})

export const removeFriendSchema = z.object({
  friendId: z.string()
})

export const newProfilePictureSchema = z.object({
  picture: z.any().refine(file => "image/".includes(file))
})

export const newUsernameSchema = z.object({
  newUsername: z.string()
})

export const chatSchema = z.object({
  roomId: z.string().optional()
})

export const newChatSchema = z.object({
  friendId: z.string()
})

export const updateChatSchema = z.object({
  chat: chatSchema,
  friendId: z.string(),
  text: z.string()
})

export const newMessageSchema = z.object({
  text: z.string().optional(),
  friendId: z.string(),
  chat: chatSchema.optional()
})

export const editMessageSchema = z.object({
  messageId: z.string(),
  text: z.string()
})

export const deleteMessageSchema = z.object({
  messageId: z.string()
})

export const deleteChatSchema = z.object({
  chatId: z.string()
})