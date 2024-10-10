import { Post } from "@prisma/client"
import UserInterface from "./user.interface"

export default interface PostInterface extends Omit<Post, "createdAt" | "updatedAt" | "userId"> {
  id: string
  user: UserInterface
  picture: string
}