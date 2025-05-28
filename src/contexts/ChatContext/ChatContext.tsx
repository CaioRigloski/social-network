'use client'

import ChatContextInterface from '@/interfaces/contexts/chatContext/chatContext.interface'
import ChatContextProvider from '@/interfaces/contexts/chatContext/chatContextProvider.interface'
import React, { createContext, useState, useContext } from 'react'

const ChatContext = createContext<ChatContextInterface | undefined>(undefined)

export const ChatProvider: React.FC<ChatContextProvider> = ({ children }) => {
  const [chatId, setChatId] = useState<string | undefined>(undefined)

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