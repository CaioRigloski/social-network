export default interface ChatContextInterface {
  chatId: string | undefined
  addChat: (chat: string | undefined) => void
}