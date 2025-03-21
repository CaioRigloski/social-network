import { Like } from "@prisma/client"
import UserInterface from "@/interfaces/feed/user.interface"

export default interface LikeInterface extends Omit<Like, "createdAt" | "updatedAt" | "userId" | "postId"> {
  id: string
  user: UserInterface
}