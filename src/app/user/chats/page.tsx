'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import ChatInterface from "@/interfaces/chat/chat.interface"
import { chatsFetcher } from "@/lib/swr"
import { useState } from "react"
import useSWR from "swr"

export default function Chats() {
  const chats = useSWR("/api/user/get-chats", chatsFetcher)
  const [ activeChat, setActiceChat ] = useState<ChatInterface | null>()

  if(!chats.data) return <p>No chat available</p>

  return (
    <main>
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarHeader>Chats</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {
                  chats.data.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <div className="flex w-full items-center gap-2">
                        <a href={`/user/profile/${chat.friend.id}`}>
                          <span>{chat.friend.username}</span>
                        </a>
                        <time className="ml-auto text-xs" dateTime={chat.messages.at(0)?.createdAt.toString()}/>
                      </div>
                      <span className="line-clamp-2 whitespace-break-spaces text-xs">
                        {chat.messages.at(0)?.text}
                      </span>
                    </div>
                  ))
                }
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          </Sidebar>
      </SidebarProvider>
    </main>
  )
}