
import Link from "next/link"
import { AvatarComponent } from "../Avatar/Avatar"
import { Textarea } from "../ui/textarea"
import { useSession } from "next-auth/react"
import { useChat } from "@/contexts/ChatContext/ChatContext"
import { useEffect, useState } from "react"
import { detectEnterKey } from "@/lib/utils"
import createOrUpdateChat from "@/components/Chat/actions"
import { SocketEvent } from "@/types/socket/event.type"
import { socket } from "@/socket"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import ChatInterface from "@/interfaces/chat/chat.interface"
import { mutate } from "swr"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { Cross1Icon } from "@radix-ui/react-icons"

export function Chat() {
  const session = useSession()
  const [ inputValue, setInputValue ] = useState<string>("")
  const { chat, addChat } = useChat()

  useEffect(() => {
    socket.on<SocketEvent>("receive_message", (msg: ReceiveMessage) => {
      mutate<ChatInterface[]>("/api/user/get-chats", data => {
        data?.map(chat => {
          if(chat.id === msg.message.chatId) {
            chat.messages = [...chat.messages, msg.message]
          }
        })
        return data
      })
    })
    return () => {
      socket.off("receive_message")
    }
  }, [chat])

  async function sendMessage() {
    let friendId: string | undefined = undefined

    friendId = chat?.friend.id === session.data?.user?.id ? chat?.user.id : chat?.friend.id

    if(inputValue.trim() && friendId) {
      const newChat = await createOrUpdateChat({ text: inputValue, friendId: friendId, chat: { roomId: chat?.id } })
      socket.emit<SocketEvent>("send_message", { message: inputValue, roomId: newChat?.id})
      setInputValue("")

      if(chat && newChat) {
        addChat({ ...chat, messages: [...chat.messages, newChat?.messages[0]] })
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-2 w-[25rem] max-w-[25rem] fixed bottom-0 right-[10rem] z-50 bg-white shadow-lg rounded-t-xl">  
      {
        chat &&
          <div key={chat.id}>
            <header className="grid grid-cols-2 text-left text-sm leading-tight truncate font-semibold bg-gray-500 p-3 text-white rounded-t-xl">
              <div className="text-sm leading-6 text-black">
              {
                chat?.friend.id === session.data?.user?.id ?
                <div className="flex items-center gap-x-2">
                  <AvatarComponent user={chat.user}/>
                  <Link href="/user/profile" className=" font-semibold text-gray-900 text-white">
                    {chat.user.username}
                  </Link>
                </div>
                :
                <div  className="flex items-center gap-x-2">
                  <AvatarComponent user={chat.friend}/>
                  <Link href="/user/profile" className="font-semibold text-gray-900 text-white">
                    {chat.friend.username}
                  </Link>
                </div>
              }
              </div>
              <button type="button" className="justify-self-end self-start" onClick={() => addChat(undefined)}>
                <Cross1Icon/>
              </button>
            </header>
            <ScrollArea className="flex flex-1 flex-col gap-2 p-4 min-h-[25rem] max-h-[25rem]">
              {
                chat?.messages.map(message =>
                  message.user.id === session.data?.user?.id ?
                  <span key={message.id} className="w-fit justify-self-end h-fit flex flex-col">
                    <p className="text-white p-2 bg-green-500 rounded-xl w-fit">{message.text}</p>
                    <time className="ml-auto text-[0.50rem]" dateTime={message.createdAt.toString()}>
                      { new Date(message.createdAt).toLocaleTimeString() }
                    </time>
                  </span>
                  :
                  <span key={message.id} className="w-fit flex flex-col">
                    <p key={message.id} className="text-white p-3 bg-cyan-500 rounded-xl w-fit">{message.text}</p>
                    <time className="ml-auto text-[0.50rem] self-start ml-0" dateTime={message.createdAt.toString()}>
                      { new Date(message.createdAt).toLocaleTimeString() }
                    </time>
                  </span>
                )
              }
            </ScrollArea>
            <Separator className="w-[95%] justify-self-center mb-2"/>
            <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()} className="resize-none focus:!ring-transparent border border-2 gray-100 w-[90%] justify-self-center scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-100" placeholder="Type here..."/>
          </div>
      }
    </div>
  )
}