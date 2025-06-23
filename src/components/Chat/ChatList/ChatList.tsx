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
import { DeleteChat } from "@/interfaces/socket/data/deleteChat.interface"
import { Time } from "@/components/Time/Time"
import { useTranslations } from "next-intl"

const socket = io()

export function ChatList() {
  const t = useTranslations()

  const session = useSession()

  const chats = useSWR(session.data && API_ROUTES.users(session.data?.user.id).chats(), chatsFetcher)

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
            messages: [{
              ...chat.messages[0],
              deleted: true
            }]
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

  function handleDeleteChat(msg: DeleteChat) {
    chats.mutate(data => {
      return data?.map(chat => {
        if(chat.id === msg.chatId && chat.messages[0].user.id === msg.userId) {
          return {
            ...chat,
            messages: [{
              ...chat.messages[0],
              deleted: true
            }]
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
    socket.on<SocketEvent>("delete_chat", handleDeleteChat)

    return () => {
      socket.off<SocketEvent>("receive_message")
      socket.off<SocketEvent>("delete_message")
      socket.off<SocketEvent>("edit_message")
      socket.off<SocketEvent>("delete_chat")
    }
  }, [chats.data])

  async function deleteChatAndMutateChatData(chatId: string) {
    deleteChat({chatId: chatId}).then(() => {
      socket.emit<SocketEvent>("delete_chat", { chatId: chatId, userId: session.data?.user.id } as DeleteChat)
    })
  }

  if(chats.data?.length === 0) return <p className="text-center">{ t('chat.noChatsYet') }</p>

  return (
    <ScrollArea className="h-[20rem]">
      {
        chats.data?.map((chat) => (
          chat.messages[0] &&
            <div key={chat.id} onClick={() => { !optionsIsOnHover && addChat(chat.id) }} className="group/avatar flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-primary-foreground hover:text-color-secondary w-11/12 rounded-lg justify-self-center cursor-pointer h-18">
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
                      <AvatarComponent user={chat.friend} disabled/>
                      <span>{chat.friend.username}</span>
                    </>
                  }
                </div>
                <span className="ml-auto text-xs">
                  {
                    chat.messages[0] && <Time className="ml-auto text-[0.50rem]" date={chat.messages[0].createdAt} />
                  }
                </span>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 m-0 h-fit w-fit duration-400 ease-in" title="Options" onMouseEnter={() => setOptionsIsOnHover(true)} onMouseLeave={() => setOptionsIsOnHover(false)}>
                        <MoreVertical className="text-gray-300 w-4 p-0 duration-300 ease-in hover:text-black"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => deleteChatAndMutateChatData(chat.id)}>
                        { t('common.delete') }
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
              <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                {chat.messages[0].deleted ? t('chat.deletedMessage') : chat.messages[0].text}
              </span>
            </div>
        ))
      }
    </ScrollArea>
    
  )
}
