import { Post } from "@prisma/client"
import UserInterface from "./user.interface"
import CommentInterface from "./comment.interface"

export default interface PostInterface extends Omit<Post, "createdAt" | "updatedAt" | "userId"> {
  id: string
  user: UserInterface
  comments: CommentInterface[]
  picture: string
}