import { Post } from "@prisma/client"
import UserInterface from "./user.interface"
import CommentInterface from "./comment.interface"
import LikeInterface from "./like.interface"


export default interface PostInterface extends Omit<Post, "createdAt" | "updatedAt" | "userId"> {
  id: string
  user: UserInterface
  description?: String
  comments: CommentInterface[]
  commentsCount: number
  likes: LikeInterface[]
  likesCount: number
  picture: string
}