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
  picture: z.string().refine((val) => !val || val.startsWith("data:image/"), {
    message: "The file must be a valid image",
  }).optional(),
  description: z.string().max(500, "Description must have a maximum of 500 characters").optional()
}).refine(data =>
  data.picture || data.description,
  {
    message: "You must provide either a picture or a description.",
    path: ["description"]
  }
)

export const deletePostSchema = z.object({
  postId: z.string(),
  imageName: z.string().nullable().optional()
})

export const newCommentSchema = z.object({
  postId: z.string(),
  text: z.string().max(500, "Comment must have a maximum of 500 characters")
})

export const deleteCommentSchema = z.object({
  commentId: z.string()
})

export const editCommentSchema = z.object({
  commentId: z.string(),
  text: z.string().max(500, "Comment must have a maximum of 500 characters")
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
  text: z.string().max(500, "Message must have a maximum of 500 characters"),
  friendId: z.string(),
  chat: chatSchema.optional()
})

export const editMessageSchema = z.object({
  messageId: z.string(),
  text: z.string().max(500, "Message must have a maximum of 500 characters")
})

export const deleteMessageSchema = z.object({
  messageId: z.string()
})

export const deleteChatSchema = z.object({
  chatId: z.string()
})


export const searchSchema = z.object({
  query: z.string().min(1, "Search term is required"),
  posts: z.boolean().optional(),
  users: z.boolean().optional(),
}).refine(data =>
  data.posts || data.users,
  {
    message: "You must select at least one search type.",
    path: ["posts"]
  }
)
