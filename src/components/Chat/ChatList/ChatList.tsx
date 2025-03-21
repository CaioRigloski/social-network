'use client'

import { chatsFetcher } from "@/lib/swr"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { SocketEvent } from "@/types/socket/event.type"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import React from 'react'
import { ScrollArea } from '../../ui/scroll-area'
import { useChat } from '@/contexts/ChatContext/ChatContext'
import { AvatarComponent } from '@/components/Avatar/Avatar'
import { API_ROUTES } from '@/lib/apiRoutes'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical } from 'lucide-react'
import { deleteChat } from '../actions'
import { io } from "socket.io-client"
import { DeleteMessage } from "@/interfaces/socket/data/deleteMessage.interface"
import { EditMessage } from "@/interfaces/socket/data/editMessage.interface"


export function ChatList() {
  const session = useSession()
  const socket = io()

  const chats = useSWR(API_ROUTES.user.chat.getChats, chatsFetcher)

  const { addChat } = useChat()

  const [ optionsIsOnHover, setOptionsIsOnHover ] = useState<boolean>(false)

  function handleReceiveMessage(msg: ReceiveMessage) {
    chats.mutate(data => {
      return data?.map(chat => {
        if (chat.id === msg.message.chatId) {
          const updatedChat = { 
            ...chat, 
            messages: [msg.message] 
          }

          return updatedChat
        }
        return chat
      })
    }, false)
  }

  function handleDeleteMessage(msg: DeleteMessage) {
    chats.mutate(data => {
      return data?.map(chat => {
        if(chat.id === msg.chatId && chat.messages[0] && chat.messages[0].id === msg.messageId) {
          return {
            ...chat,
            messages: [ msg.previousMessage ]
          }
        }
        return chat
      })
    }, false)
  }

  function handleEditMessage(msg: EditMessage) {
    chats.mutate(data => {
      return data?.map(chat => {
        if(chat.id === msg.chatId && chat.messages[0] && chat.messages[0].id === msg.messageId) {
          return {
            ...chat,
            messages: chat.messages.map(message => {
              return {
                ...message,
                text: msg.text,
                updatedAt: msg.updatedAt
              }
            })
          }
        }
        return chat
      })
    }, false)
  }

  useEffect(() => {
    const chatIds = chats.data?.map(chat => chat.id)
  
    if(chatIds) {
      socket.emit<SocketEvent>("join_room", chatIds)
    }

    socket.on<SocketEvent>("receive_message", handleReceiveMessage)
    socket.on<SocketEvent>("delete_message", handleDeleteMessage)
    socket.on<SocketEvent>("edit_message", handleEditMessage)


    return () => {
      socket.off<SocketEvent>("receive_message")
      socket.off<SocketEvent>("delete_message")
      socket.off<SocketEvent>("edit_message")
    }
  }, [socket])

  function formatDate(date: Date) {
    const today = new Date()
    const isToday = new Date(date).toDateString() === today.toDateString()
    
    if (isToday) {
      return `Today ${new Date(date).toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", "")}`
    } else {
      return new Date(date).toLocaleTimeString(navigator.language, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", "")
    }
  }

  async function deleteChatAndMutateChatData(chatId: string) {
    await deleteChat({chatId: chatId}).then(() => {
      chats.mutate(data => {
        return data?.filter(chat => chat.id !== chatId)
      }, false)

      addChat(undefined)
    })
  }

  return (
    <ScrollArea className="h-[20rem]">
      {
        chats.data?.map((chat) => (
          chat.messages[0] &&
            <div key={chat.id} onClick={() => { !optionsIsOnHover && addChat(chat.id) }} className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-[20rem] cursor-pointer">
              <div className="flex w-full items-center gap-2">
                <div className='flex flex-row items-center gap-2'>
                  {
                    chat?.friend.id === session.data?.user?.id ?
                    <>
                      <AvatarComponent user={chat.user} disabled/>
                      <span>{chat.user.username}</span>
                    </>
                    :
                    <>
                      <AvatarComponent user={chat.user} disabled/>
                      <span>{chat.friend.username}</span>
                    </>
                  }
                </div>
                <span className="ml-auto text-xs">
                  {
                    chat.messages[0] &&
                    <time className="ml-auto text-[0.50rem]" dateTime={chat.messages[0].createdAt.toString()}>
                      { formatDate(chat.messages[0].createdAt) } 
                    </time>
                  }
                </span>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 m-0 h-fit w-fit duration-400 ease-in" title="Options" onMouseEnter={() => setOptionsIsOnHover(true)} onMouseLeave={() => setOptionsIsOnHover(false)}>
                        <MoreVertical className="text-gray-300 w-5 p-0 duration-300 ease-in hover:text-black"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => deleteChatAndMutateChatData(chat.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
              <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                {chat.messages[0] && chat.messages[0].text}
              </span>
            </div>
        ))
      }
    </ScrollArea>
    
  )
}
