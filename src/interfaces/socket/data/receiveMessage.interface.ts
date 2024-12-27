import ChatInterface from "@/interfaces/chat/chat.interface"
import UserInterface from "@/interfaces/feed/user.interface"

export interface ReceiveMessage {
  message: string
  sender: UserInterface
  receiverId: string
  chat: ChatInterface
}