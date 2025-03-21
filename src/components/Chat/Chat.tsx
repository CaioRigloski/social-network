import Link from "next/link"
import { AvatarComponent } from "../Avatar/Avatar"
import { Textarea } from "../ui/textarea"
import { useSession } from "next-auth/react"
import { useChat } from "@/contexts/ChatContext/ChatContext"
import { useEffect, useRef, useState } from "react"
import { detectEnterKey } from "@/lib/utils"
import { deleteMessage, editMessage } from "@/components/Chat/actions"
import { SocketEvent } from "@/types/socket/event.type"
//import { socket } from "@/socket"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { Cross1Icon, PaperPlaneIcon } from "@radix-ui/react-icons"
import { Button } from "../ui/button"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import useSWR, { mutate } from "swr"
import ChatInterface from "@/interfaces/chat/chat.interface"
import { Dialog,  DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import MessageInterface from "@/interfaces/chat/message.interface"
import updateChat from "@/components/Chat/actions"
import { chatFetcher } from "@/lib/swr"
import { API_ROUTES } from "@/lib/apiRoutes"
import { io } from "socket.io-client"
import { DeleteMessage } from "@/interfaces/socket/data/deleteMessage.interface"

export function Chat() {
  const socket = io()
  const session = useSession()
  const { chatId, addChat } = useChat()
  const [ inputValue, setInputValue ] = useState<string>("")
  const [ isMessageEditOpen, setIsMessageEditOpen ] = useState<boolean>(false)
  const [ messageToEdit, setMessageToEdit ] = useState<MessageInterface | undefined>(undefined)
  const [ editedMessage, setEditedMessage ] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  if(!chatId) return null

  const chatResult = useSWR([API_ROUTES.user.chat.getChat, chatId], chatFetcher)
  const chat = chatResult.data

  useEffect(() => {
    socket.emit<SocketEvent>("join_room", chat?.id)
  }, [socket])

  // scroll to bottom on new message with instant behavior
  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  function handleReceiveMessage(msg: ReceiveMessage) {
    if(msg.chatId === chat?.id) {
      chatResult.mutate(chatData => {
        if(chatData && msg.message.user.id !== session.data?.user.id) {
          return {
            ...chatData,
            messages: [...chatData.messages, msg.message]
          }
        } else {
          return chatData
        }
      }, false)
    }
  }

  function handleDeleteMessage(msg: DeleteMessage) {
    if(msg.chatId === chat?.id) {
      chatResult.mutate(chatData => {
        if(chatData) {
          return {
            ...chatData,
            messages: chatData.messages.filter(message => message.id !== msg.messageId)
          }
        }
      }, false)
    }
  }

  useEffect(() => {
    socket.on<SocketEvent>("receive_message", handleReceiveMessage)
    socket.on<SocketEvent>("delete_message", handleDeleteMessage)
  
    return () => {
      socket.off("receive_message", handleReceiveMessage)
    }
  }, [socket])


  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "instant"
    })
  }

  async function sendMessage() {
    let friendId: string | undefined = undefined

    friendId = chat?.friend.id === session.data?.user?.id ? chat?.user.id : chat?.friend.id

    if(inputValue.trim() && friendId) {
      const newChat = await updateChat({ text: inputValue, friendId: friendId, chat: { roomId: chat?.id } }).then((chatData) => {
        chatResult.mutate(data => {
          if(!data) return data

          return {
            ...data,
            messages: [...data.messages, chatData?.messages.at(0) as MessageInterface]
          }
        }, false)
        return chatData
      })

      socket.emit<SocketEvent>("send_message", { message: newChat?.messages.at(0), chatId: newChat?.id})
      setInputValue("")
    }
  }

  async function deleteMessageAndMutateChatData(messageId: string) {
    deleteMessage({ messageId }).then(() => {
      chatResult.mutate((data) => {
        if (!data) return data
    
        return {
          ...data,
          messages: data.messages.filter((message) => message.id !== messageId),
        }
      }, false)

      mutate<ChatInterface[]>(API_ROUTES.user.chat.getChats, data => {
        return data?.map(chatData => {
          if (chatData.id === chatId && chatData.messages.at(0)?.id === messageId && chat) {
            return {
                ...chatData,
                messages: [
                  {
                    ...chat.messages[chat.messages.length - 1]
                  }
                ]
            }
          }
          return chatData
        })
      }, false)
    })

    socket.emit<SocketEvent>("delete_message", { chatId: chat?.id, messageId: messageId })
  }

  function openMessageEdit(message: MessageInterface) {
    setIsMessageEditOpen(true)
    setMessageToEdit(message)
  }

  function saveMessageEdit() {
    if(messageToEdit?.id && editedMessage.length > 0 && editedMessage !== messageToEdit.text) {
      editMessage({ messageId: messageToEdit?.id, text: editedMessage }).then((messageData) => {
        chatResult.mutate(chatData => {
          if(chatData && messageData) {
            return {
              ...chatData,
              messages: chatData.messages.map(message => {
                if(message.id === messageData.id) {
                  return {
                    ...message,
                    text: messageData.text,
                    updatedAt: messageData.updatedAt
                  }
                }
                return message
              })
            }
          }
        }, false)

        mutate<ChatInterface[]>(API_ROUTES.user.chat.getChats, data => data?.map(chat => {
          if (chat.id === messageData?.chatId) {
            chat.messages.map(message => {
              if (message.id === messageData?.id) {
                message.text = messageData?.text
                message.updatedAt = messageData?.updatedAt
              }
              return message
            })
          }
          return chat
        }), false)
      })
    }
    setIsMessageEditOpen(false)
    setMessageToEdit(undefined)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-2 w-[25rem] max-w-[25rem] fixed bottom-0 right-[10rem] z-50 bg-white shadow-lg rounded-t-xl">  
      {
        chat &&
          <div key={chat.id}>
            <header className="grid grid-cols-2 text-left text-sm leading-tight truncate font-semibold bg-gray-800 p-3 text-white rounded-t-xl">
              <div className="text-sm leading-6 text-black">
                <div className="flex items-center gap-x-2">
                {
                  chat?.friend.id === session.data?.user?.id ?
                    <>
                      <AvatarComponent user={chat.user}/>
                      <Link href={`/user/profile/${chat.user.id}`} className="font-semibold text-gray-900 text-white">
                        {chat.user.username}
                      </Link>
                    </>
                    :
                    <>
                      <AvatarComponent user={chat.friend}/>
                      <Link href={`/user/profile/${chat.friend.id}`} className="font-semibold text-gray-900 text-white">
                        {chat.friend.username}
                      </Link>
                    </>
                }
                </div>
              </div>
              <Button variant="ghost" className="justify-self-end self-start p-1 w-fit h-fit duration-400 ease-in" onClick={() => addChat(undefined)}>
                <Cross1Icon/>
              </Button>
            </header>
            <ScrollArea className="flex flex-1 flex-col gap-2 p-4 min-h-[25rem] max-h-[25rem]">
              {
                chat?.messages.map(message =>
                  message.user.id === session.data?.user?.id ?
                  <span key={message.id} className="flex w-full justify-end items-start">
                    <div className="w-fit h-fit flex flex-col items-end">
                      <p className="text-white p-2 bg-green-500 rounded-xl w-fit whitespace-pre-wrap">{message.text}</p>
                      <time className="ml-auto text-[0.50rem]" dateTime={message.createdAt.toString()}>
                        { new Date(message.createdAt).toLocaleTimeString() }
                      </time>
                    </div>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 m-0 h-fit w-fit duration-400 ease-in" title="Options">
                          <MoreVertical className="text-gray-300 w-5 p-0 duration-300 ease-in hover:text-black"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openMessageEdit(message)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteMessageAndMutateChatData(message.id)} className="cursor-pointer">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                  :
                  <span key={message.id} className="w-fit flex flex-col">
                    <p className="text-white p-2 bg-cyan-500 rounded-xl w-fit whitespace-pre-wrap">{message.text}</p>
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
              <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => detectEnterKey(e) && sendMessage()} className="resize-none focus:!ring-transparent border border-2 gray-100 w-[90%] justify-self-center scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-100" placeholder="Type here..."/>
              <Button variant="ghost" onClick={() => sendMessage()} className="p-2">
                <PaperPlaneIcon width={20} height={20}/>
              </Button>
            </div>
          </div>
      }
      <Dialog open={isMessageEditOpen} onOpenChange={setIsMessageEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Message edit
            </DialogTitle>
            <DialogDescription>
              Edit your message to perfection.
            </DialogDescription>
          </DialogHeader>
          <Textarea defaultValue={messageToEdit?.text} onChange={e => setEditedMessage(e.target.value)}/>
          <DialogFooter>
            <Button onClick={(() => saveMessageEdit())}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}