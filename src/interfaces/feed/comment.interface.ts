import { Comment } from "@prisma/client"
import UserInterface from "./user.interface"

export default interface CommentInterface extends Omit<Comment, "createdAt" | "updatedAt" | "userId" | "postId"> {
  id: string
  user: UserInterface
  text: string
}