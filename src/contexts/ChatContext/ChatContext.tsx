'use client'

import ChatInterface from '@/interfaces/chat/chat.interface'
import ChatContextInterface from '@/interfaces/contexts/chatContext/chatContext.interface'
import ChatContextProvider from '@/interfaces/contexts/chatContext/chatContextProvider.interface'
import React, { createContext, useState, useContext } from 'react'


const ChatContext = createContext<ChatContextInterface | undefined>(undefined)

export const ChatProvider: React.FC<ChatContextProvider> = ({ children }) => {
  const [chat, setChat] = useState<ChatInterface | undefined>(undefined)

  const addChat = (chat: ChatInterface | undefined) => {
    setChat(chat)
  }

  return (
    <ChatContext.Provider value={{ chat, addChat }}>
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
