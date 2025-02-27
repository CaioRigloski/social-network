import ChatInterface from "@/interfaces/chat/chat.interface";

export default interface ChatContextInterface {
  chat: ChatInterface | undefined
  addChat: (chat: ChatInterface | undefined) => void
}