import MessageInterface from "@/interfaces/chat/message.interface"

export interface DeleteMessage {
  chatId: string
  messageId: string
  previousMessage: MessageInterface
}