
import Link from "next/link"
import { AvatarComponent } from "../Avatar/Avatar"
import { Textarea } from "../ui/textarea"
import { useSession } from "next-auth/react"
import { useChat } from "@/contexts/ChatContext/ChatContext"
import { useEffect, useRef, useState } from "react"
import { detectEnterKey } from "@/lib/utils"
import createOrUpdateChat, { deleteMessage } from "@/components/Chat/actions"
import { SocketEvent } from "@/types/socket/event.type"
import { socket } from "@/socket"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { Cross1Icon, PaperPlaneIcon } from "@radix-ui/react-icons"
import { Button } from "../ui/button"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { mutate } from "swr"
import ChatInterface from "@/interfaces/chat/chat.interface"

export function Chat() {
  const session = useSession()
  const [ inputValue, setInputValue ] = useState<string>("")
  const { chat, addChat } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function sendMessage() {
    let friendId: string | undefined = undefined

    friendId = chat?.friend.id === session.data?.user?.id ? chat?.user.id : chat?.friend.id

    if(inputValue.trim() && friendId) {
      const newChat = await createOrUpdateChat({ text: inputValue, friendId: friendId, chat: { roomId: chat?.id } })

      if (newChat?.messages[0]) {

        const newMessage: ReceiveMessage = {
          message: newChat.messages[0],
          receiverId: friendId
        }

        socket.emit<SocketEvent>("send_message", newMessage)
        setInputValue("")

        if(chat && newChat) {
          addChat({ ...chat, messages: [...chat.messages, newChat.messages[0]] })
        }
      }
      socket.emit<SocketEvent>("send_message", { message: inputValue, roomId: newChat?.id})
      setInputValue("")

      if(chat && newChat) {
        addChat({ ...chat, messages: [...chat.messages, newChat?.messages[0]] })
      }
    }
  }

  async function deleteMessageAndMutateChatData(messageId: string) {
    await deleteMessage({ messageId }).then((dataChat) => {
      mutate<ChatInterface[]>("/api/feed/get-chats", data => data?.map(chat => {
        if (chat.id === dataChat?.id) {
          chat.messages.filter(message => message.id !== messageId)
        }
        return chat
      }), false)
      
      if (chat && chat.id) {
        addChat({ ...chat, messages: chat.messages.filter(message => message.id !== messageId) })
      }
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-2 w-[25rem] max-w-[25rem] fixed bottom-0 right-[10rem] z-50 bg-white shadow-lg rounded-t-xl">  
      {
        chat &&
          <div key={chat.id}>
            <header className="grid grid-cols-2 text-left text-sm leading-tight truncate font-semibold bg-gray-800 p-3 text-white rounded-t-xl">
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
                  <span key={message.id} className="flex w-full justify-end items-start">
                    <div className="w-fit h-fit flex flex-col items-end">
                      <p className="text-white p-2 bg-green-500 rounded-xl w-fit">{message.text}</p>
                      <time className="ml-auto text-[0.50rem]" dateTime={message.createdAt.toString()}>
                        { new Date(message.createdAt).toLocaleTimeString() }
                      </time>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 m-0 h-fit w-fit" title="Options">
                          <MoreVertical className="text-gray-300 w-5 p-0 hover:text-black"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => deleteMessageAndMutateChatData(message.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

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
              <span ref={messagesEndRef} />
            </ScrollArea>
            <Separator className="w-[95%] justify-self-center mb-2"/>
            <div className="flex flex-row gap-2 p-2 items-center justify-center">
              <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()} className="resize-none focus:!ring-transparent border border-2 gray-100 w-[90%] justify-self-center scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-100" placeholder="Type here..."/>
              <Button variant="ghost" onClick={() => sendMessage()} className="p-2">
                <PaperPlaneIcon width={20} height={20}/>
              </Button>
            </div>
          </div>
      }
    </div>
  )
}