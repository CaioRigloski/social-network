import { User } from "@prisma/client"

export default interface UserInterface extends Omit<User, "createdAt" | "updatedAt" | "password"> {
  id: string
  username: string
  createdAt?: Date
  password?: string
}