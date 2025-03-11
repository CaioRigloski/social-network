'use client'

import ChatInterface from '@/interfaces/chat/chat.interface'
import ChatContextInterface from '@/interfaces/contexts/chatContext/chatContext.interface'
import ChatContextProvider from '@/interfaces/contexts/chatContext/chatContextProvider.interface'
import React, { createContext, useState, useContext } from 'react'
import useSWR from 'swr'
import { chatsFetcher } from '@/lib/swr'

const ChatContext = createContext<ChatContextInterface | undefined>(undefined)

export const ChatProvider: React.FC<ChatContextProvider> = ({ children }) => {
  const [chatId, setChatId] = useState<string | undefined>(undefined)
  
  const { data: chat } = useSWR(
    chatId ? ['/api/feed/get-chats', chatId] : null,
    ([url, id]) => chatsFetcher(`${url}?chatId=${id}`)
  )

  const addChat = (id: string | undefined) => {
    setChatId(id)
  }

  return (
    <ChatContext.Provider value={{ chatId, addChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return context
}