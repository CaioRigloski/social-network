'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from '@/components/ui/textarea'
import { socket } from '@/socket'
import createOrUpdateChat from "./actions"
import { chatsFetcher, friendsFetcher } from "@/lib/swr"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { detectEnterKey, imageFormats, path } from "@/lib/utils"
import UserInterface from "@/interfaces/feed/user.interface"
import { SocketEvent } from "@/types/socket/event.type"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import React from 'react'
import { Separator } from "@/components/ui/separator"
import { NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function Chats() {
  const session = useSession()

  const chats = useSWR("/api/user/get-chats", chatsFetcher)
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
      const newChat = await createOrUpdateChat({ text: inputValue, friendId: friendId, chatSchema: { roomId: activeChatId } })
      socket.emit<SocketEvent>("send_message", { message: inputValue, roomId: newChat?.id})
      setInputValue("")
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
          newFriendChat && <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()}/>
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
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 flex-col gap-4 p-4 w-[30rem] max-w-[30rem]">  
            {
              activeChatId &&
              chats.data?.map(chat => {
                if(chat.id === activeChatId) {
                  return (
                    <div key={chat.id}>
                      <header className="grid flex-1 text-left text-sm leading-tight truncate font-semibold bg-gray-500 p-3 text-white">
                        <div className="text-sm leading-6 text-black">
                        {
                          chat?.friend.id === session.data?.user?.id ?
                          <Link href="/user/profile" className="flex items-center gap-x-2">
                            <Avatar>
                              <AvatarImage src={`/images/${path.profile}/${chat.user.profilePicture}.${imageFormats.profilePicture}`} alt={`@${chat.user.username}`} />
                              <AvatarFallback>{chat.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-gray-900 text-white">
                                {chat.user.username}
                            </p>
                          </Link>
                          :
                          <Link href="/user/profile" className="flex items-center gap-x-2">
                            <Avatar>
                              <AvatarImage src={`/images/${path.profile}/${chat.friend.profilePicture}.${imageFormats.profilePicture}`} alt={`@${chat.friend.username}`} />
                              <AvatarFallback>{chat.friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-gray-900 text-white">
                                {chat.friend.username}
                            </p>
                          </Link>
                        }
                        </div>
                      </header>
                      <div className="flex flex-1 flex-col gap-2 p-4 border min-h-[25rem] max-h-[25rem] overflow-y-auto">
                        {
                          chat?.messages.map(message =>
                            message.user.id === session.data?.user?.id ?
                            <span key={message.id} className="w-fit self-end h-fit flex flex-col">
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
                      </div>
                        <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()} className="resize-none" placeholder="Type here..."/>
                    </div>
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