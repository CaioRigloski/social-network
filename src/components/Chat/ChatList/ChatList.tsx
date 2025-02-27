'use client'

import { socket } from '@/socket'
import createOrUpdateChat from '@/app/user/chats/actions'
import { chatsFetcher, friendsFetcher } from "@/lib/swr"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import useSWR from "swr"
import UserInterface from "@/interfaces/feed/user.interface"
import { SocketEvent } from "@/types/socket/event.type"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import React from 'react'
import { ScrollArea } from '../../ui/scroll-area'
import { useChat } from '@/contexts/ChatContext/ChatContext'


export function ChatList() {
  const session = useSession()

  const chats = useSWR("/api/user/get-chats", chatsFetcher)
  const {chat, addChat} = useChat()
  const friends = useSWR("/api/user/get-friends", friendsFetcher)

  const [ activeChatId, setActiveChatId ] = useState<string | undefined>()
  const [ newFriendChat, setNewFriendChat ] = useState<UserInterface | null>()
  const [ inputValue, setInputValue ] = useState<string>("")
  
  useEffect(() => {
    socket.on<SocketEvent>("receive_message", (msg: ReceiveMessage) => {
      chats.mutate(data => {
        data?.map(chat => {
          if(chat.id === msg.message.chatId) {
            [...chat.messages, msg.message]
          }
        })
        return data
      })
    })
    return () => {
      socket.off("receive_message")
    }
  }, [chats])

  async function sendMessage() {
    let friendId: string | undefined = undefined

    if(newFriendChat) {
      friendId = newFriendChat.id
    } else {
      chats.data?.map(chat => {
        if(chat.id === activeChatId) {
          friendId = chat.friend.id === session.data?.user?.id ? chat?.user.id : chat?.friend.id 
        }
      })
    }

    if(inputValue.trim() && friendId) {
      const newChat = await createOrUpdateChat({ text: inputValue, friendId: friendId, chat: { roomId: activeChatId } })
      socket.emit<SocketEvent>("send_message", { message: inputValue, roomId: newChat?.id})
      setInputValue("")
    }
  }

  return (
    <ScrollArea className="h-[20rem]">
      {
        chats.data?.map((chat) => (
          chat.messages.length > 0 &&
            <div key={chat.id} onClick={() => addChat(chat)} className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-[20rem] cursor-pointer">
              <div className="flex w-full items-center gap-2">
                <span>
                {
                  chat?.friend.id === session.data?.user?.id ?
                  <a href={`/user/profile/${chat.user.id}`}>
                    <span>{chat.user.username}</span>
                  </a>
                  :
                  <a href={`/user/profile/${chat.friend.id}`}>
                    <span>{chat.friend.username}</span>
                  </a>
                }
                </span>
                <span className="ml-auto text-xs">
                  <time className="ml-auto text-xs" dateTime={chat.messages.at(-1)?.createdAt.toString()}>
                    {chat.messages.at(-1)?.createdAt.toLocaleString()}
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
