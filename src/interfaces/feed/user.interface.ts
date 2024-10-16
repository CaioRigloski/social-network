import { User } from "@prisma/client"

export default interface UserInterface extends Omit<User, "createdAt" | "updatedAt" | "password" | "profilePicture"> {
  id: string
  username: string
  profilePicture?: string | null
  createdAt?: Date
  password?: string
}