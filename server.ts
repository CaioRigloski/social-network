import { createServer } from "node:http"
import next from "next"
import { Server, Socket } from "socket.io"
import { SocketEvent } from "./src/types/socket/event.type"
import { ReceiveMessage } from "@/interfaces/socket/data/receiveMessage.interface"
import { DeleteMessage } from "@/interfaces/socket/data/deleteMessage.interface"
import { EditMessage } from "@/interfaces/socket/data/editMessage.interface"
import { DeleteChat } from "@/interfaces/socket/data/deleteChat.interface"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer)

  io.on("connection", (socket: Socket) => {
    console.log("Client connected")

    socket.on<SocketEvent>("join_room", (chatId) => {
      socket.join(chatId)
    })

    socket.on<SocketEvent>("send_message", (data: ReceiveMessage) => {
      io.to(data.chatId).emit<SocketEvent>("receive_message", data)
    })

    socket.on<SocketEvent>("delete_message", (data: DeleteMessage) => {
      io.to(data.chatId).emit<SocketEvent>("delete_message", data)
    })

    socket.on<SocketEvent>("edit_message", (data: EditMessage) => {
      io.to(data.chatId).emit<SocketEvent>("edit_message", data)
    })

    socket.on<SocketEvent>("delete_chat", (data: DeleteChat) => {
      io.to(data.chatId).emit<SocketEvent>("delete_chat", data)
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected")
    })
  })

  httpServer
    .once("error", (err: Error) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})