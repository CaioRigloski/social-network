import { Message } from "@prisma/client";
import UserInterface from "../feed/user.interface";

export default interface MessageInterface extends Omit<Message, "userId" | "updatedAt" | "deleted"> {
  id: string
  user: UserInterface
  chatId: string
  text: string
  createdAt: Date
  updatedAt?: Date
  deleted?: boolean
}