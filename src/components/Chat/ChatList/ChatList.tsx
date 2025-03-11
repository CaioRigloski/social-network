'use client'

import { socket } from '@/socket'
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


export function ChatList() {
  const session = useSession()

  const chats = useSWR(API_ROUTES.user.chat.getChats, chatsFetcher)

  const { addChat } = useChat()

  useEffect(() => {
    socket.on<SocketEvent>("receive_message", (msg: ReceiveMessage) => {
      chats.mutate((data) => {
        return data?.map((chat) => {
          if (chat.id === msg.message.chatId) {
            const updatedChat = { 
              ...chat, 
              messages: [...chat.messages, msg.message] 
            }
            return updatedChat
          }
          return chat
        })
      })
    })
    return () => {
      socket.off("receive_message")
    }
  }, [chats])

  const formatDate = (date: Date) => {
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

  return (
    <ScrollArea className="h-[20rem]">
      {
        chats.data?.map((chat) => (
          chat.messages.length > 0 &&
            <div key={chat.id} onClick={() => addChat(chat.id)} className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-[20rem] cursor-pointer">
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
                  <time className="ml-auto text-[0.50rem]" dateTime={chat.messages.at(-1)?.createdAt.toString()}>
                    { formatDate(chat.messages.at(-1)!.createdAt)} 
                  </time>
                </span>
              </div>
              <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                {chat.messages.at(-1)?.text}
              </span>
            </div>
        ))
      }
    </ScrollArea>
    
  )
}
