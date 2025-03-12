import { Post } from "@prisma/client"
import UserInterface from "../feed/user.interface"
import CommentInterface from "../feed/comment.interface"
import LikeInterface from "../feed/like.interface"


export default interface PostInterface extends Omit<Post, "createdAt" | "updatedAt" | "userId"> {
  id: string
  user: UserInterface
  description: string | null
  comments: CommentInterface[]
  commentsCount: number
  likes: LikeInterface[]
  likesCount: number
  picture: string
}