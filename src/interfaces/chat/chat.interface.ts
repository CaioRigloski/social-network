import { Chat } from "@prisma/client"
import UserInterface from "../feed/user.interface"
import MessageInterface from "./message.interface"

export default interface ChatInterface extends Omit<Chat, "createdAt"> {
  id: string
  user: UserInterface
  friend: UserInterface
  messages: MessageInterface[],
  updatedAt: Date
}