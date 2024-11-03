import { Post } from "@prisma/client"
import UserInterface from "./user.interface"
import CommentInterface from "./comment.interface"
import LikeInterface from "./like.interface"


export default interface PostInterface extends Omit<Post, "createdAt" | "updatedAt" | "userId"> {
  id: string
  user: UserInterface
  comments: CommentInterface[]
  likes: LikeInterface[]
  likesCount: number
  picture: string
}