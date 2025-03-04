import MessageInterface from "@/interfaces/chat/message.interface"

export interface ReceiveMessage {
  message: MessageInterface
  receiverId: string
}