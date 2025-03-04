import { createServer } from "node:http"
import next from "next"
import { Server, Socket } from "socket.io"
import { SocketEvent } from "./src/types/socket/event.type"

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

    socket.on("send_message", (data: unknown) => {
      io.emit('receive_message', data)
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