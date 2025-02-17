import MessageInterface from "@/interfaces/chat/message.interface"
import UserInterface from "@/interfaces/feed/user.interface"

export interface ReceiveMessage {
  message: MessageInterface
  sender: UserInterface
  receiverId: string
}