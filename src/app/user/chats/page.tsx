'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { socket } from '@/socket'
import createOrUpdateChat from "./actions"
import ChatInterface from "@/interfaces/chat/chat.interface"
import { chatsFetcher, friendsFetcher } from "@/lib/swr"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { detectEnterKey } from "@/lib/utils"
import UserInterface from "@/interfaces/feed/user.interface"
import { SocketEvent } from "@/types/socket/event.type"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"


export default function Chats() {
  const session = useSession()

  const chats = useSWR("/api/user/get-chats", chatsFetcher)
  const friends = useSWR("/api/user/get-friends", friendsFetcher)

  const [ activeChat, setActiveChat ] = useState<ChatInterface | null>()
  const [ newFriendChat, setNewFriendChat ] = useState<UserInterface | null>()
  const [ inputValue, setInputValue ] = useState("")
  const [ message, setMessage ] = useState("")

  useEffect(() => {
    // chat functions
    socket.on<SocketEvent>("receive_message", (msg: ReceiveMessage) => {
      if(msg.receiverId === session.data?.user?.id) {

        setMessage(msg.message)
      }
    })

    return () => {
      socket.off("receive_message")
    }
  }, [])
  async function sendMessage() {
    let friendId: string | undefined = undefined

    if(newFriendChat) {
      friendId = newFriendChat.id
    } else {
      friendId = activeChat?.friend.id === session.data?.user?.id ? activeChat?.user.id : activeChat?.friend.id 
    }

    if (inputValue.trim() && friendId) {
      const newRoomId = await createOrUpdateChat({ text: inputValue, friendId: friendId, chatSchema: { rommId: activeChat?.id } })
      socket.emit<SocketEvent>("send_message", { message: inputValue, roomId: newRoomId })
      setInputValue('')
    }
  }

  if(!chats.data) return <p>No chat available</p>
  return (
    <main>
      <div>
        <h1>Friends</h1>
        {
          friends.data?.map(friend => (
            <p key={friend.id} onClick={() => setNewFriendChat(friend)}>
              {friend.username}
            </p>
          ))
        }
        {
          newFriendChat && <Textarea onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()}/>
        }
      </div>
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarHeader>Chats</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {
                  chats.data.map((chat) => (
                    <div
                      onClick={() => setActiveChat(chat)}
                      key={chat.id}
                      className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <div className="flex w-full items-center gap-2">
                        {
                          chat.friend.id === session.data?.user?.id ?
                          <a href={`/user/profile/${chat.user.id}`}>
                            <span>{chat.user.username}</span>
                          </a>
                          :
                          <a href={`/user/profile/${chat.friend.id}`}>
                            <span>{chat.friend.username}</span>
                          </a>
                        }
                        <time className="ml-auto text-xs" dateTime={chat.messages.at(-1)?.createdAt.toString()}/>
                      </div>
                      <span className="line-clamp-2 whitespace-break-spaces text-xs">
                        {chat.messages.at(-1)?.text}
                      </span>
                    </div>
                  ))
                }
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          </Sidebar>
          {
            activeChat?.id &&
            <>
              <header>
                {
                  activeChat?.friend.id === session.data?.user?.id ?
                  <p>{activeChat?.user.username}</p>
                  :
                  <p>{activeChat?.friend.username}</p>
                }
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4">
                {
                  activeChat?.messages.map(message =>
                    message.user.id === session.data?.user?.id ?
                    <p key={message.id} className="text-green-500">{message.text}</p>
                    :
                    <p key={message.id}>{message.text}</p>
                  )
                }
                <Textarea onChange={e => setInputValue(e.target.value)} onKeyUp={e => detectEnterKey(e) && sendMessage()}/>
              </div>
            </>
          }
      </SidebarProvider>
    </main>
  )
}