'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { socket } from '@/socket'
import { useEffect, useState } from 'react'
import createOrUpdateChat from '@/app/user/chats/actions'

export default function Chat() {
  const [inputValue, setInputValue] = useState('')
  const [message, setMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")

  useEffect(() => {

    // socket connection
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      setIsConnected(true)
      setTransport(socket.io.engine.transport.name)

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name)
      })
    }

    function onDisconnect() {
      setIsConnected(false)
      setTransport("N/A")
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    
    // chat functions
    socket.on("receive_message", (message) => {
      setMessage(message)
    })
    
    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])
  

  async function sendMessage() {
    if (inputValue.trim()) {
      const newRoomId = await createOrUpdateChat({text: inputValue, friendId: "cm47dksrq0000gahs9y29k5dc", chatSchema: { rommId: undefined }})
      socket.emit("send_message", {message: inputValue, roomId: newRoomId})
      setInputValue('')
    }
  }
 
  return (
    <div>
      <p>{message}</p>
      <Textarea onChange={e => setInputValue(e.target.value)}/>
      <Button onClick={sendMessage}>Send</Button>
      <p>Status: { isConnected ? "connected" : "disconnected" }</p>
      <p>Transport: { transport }</p>
    </div>
  )
}