'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from '@/components/ui/textarea'
import { socket } from '@/socket'
import createOrUpdateChat from "./actions"
import { chatsFetcher, friendsFetcher } from "@/lib/swr"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { detectEnterKey } from "@/lib/utils"
import UserInterface from "@/interfaces/feed/user.interface"
import { SocketEvent } from "@/types/socket/event.type"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import React from 'react'
import { Separator } from "@/components/ui/separator"

export default function Chats() {
  const session = useSession()

  const chats = useSWR("/api/user/get-chats", chatsFetcher)
  const friends = useSWR("/api/user/get-friends", friendsFetcher)

  const [ activeChatId, setActiveChatId ] = useState<string | undefined>()
  const [ newFriendChat, setNewFriendChat ] = useState<UserInterface | null>()
  const [ inputValue, setInputValue ] = useState("")

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

    if (inputValue.trim() && friendId) {
      const newChat = await createOrUpdateChat({ text: inputValue, friendId: friendId, chatSchema: { roomId: activeChatId } })
      socket.emit<SocketEvent>("send_message", { message: inputValue, roomId: newChat?.id})
      setInputValue('')
    }
  }
 
  return (
    <main>
      <div>
        <h1>Friends</h1>
        {
          friends.data?.map(friend => (
            <div key={friend.id}>
              <p onClick={() => setNewFriendChat(friend)}>
                {friend.username}
              </p>
            </div>
          ))
        }
        {
          newFriendChat && <Textarea onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()}/>
        }
      </div>
      <SidebarProvider className="relative" style={{
        "--sidebar-width": "20rem",
      } as React.CSSProperties}>
        <Sidebar collapsible="offcanvas" className="flex-1 md:flex absolute">
          <SidebarHeader className="gap-3.5 border-b p-4">
            <div className="text-base font-medium text-foreground">
              Chats
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                  {
                    chats.data?.map((chat) => (
                      <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-[20rem] cursor-pointer">
                        <div className="flex w-full items-center gap-2">
                          <span>
                          {
                            chat?.friend.id === session.data?.user?.id ?
                            <a href={`/user/profile/${chat.user.id}`}>
                              <span>username</span>
                            </a>
                            :
                            <a href={`/user/profile/${chat.friend.id}`}>
                              <span>username</span>
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
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 flex-col gap-4 p-4">  
            {
              activeChatId &&
              chats.data?.map(chat => {
                if(chat.id === activeChatId) {
                  return (
                    <span key={chat.id}>
                      <header>
                        {
                          chat?.friend.id === session.data?.user?.id ?
                          <p>{chat?.user.username}</p>
                          :
                          <p>{chat?.friend.username}</p>
                        }
                      </header>
                      <div className="flex flex-1 flex-col gap-4 p-4">
                        {
                          chat?.messages.map(message =>
                            message.user.id === session.data?.user?.id ?
                            <p key={message.id} className="text-green-500">{message.text}</p>
                            :
                            <p key={message.id}>{message.text}</p>
                          )
                        }
                        <Textarea onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()}/>
                      </div>
                    </span>
                  )
                }
              })
            }
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  )
}