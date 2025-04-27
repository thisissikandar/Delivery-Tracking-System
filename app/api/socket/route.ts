import { NextResponse } from "next/server"
import { Server as SocketServer } from "socket.io"
import type { NextApiRequest } from "next"
import jwt from "jsonwebtoken"

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// This is needed because Vercel is a serverless environment
// and we need to maintain the socket connection across function invocations
let io: SocketServer

export async function GET(req: NextApiRequest) {
  if (io) {
    // If socket server is already initialized, return success
    return NextResponse.json({ success: true })
  }

  // @ts-ignore - req has socket property when used with Socket.io
  const res = { socket: { server: { io } } }

  if (!res.socket.server.io) {
    // Initialize Socket.io server
    io = new SocketServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    })

    io.use((socket, next) => {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication required"))
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as {
          userId: string
          email: string
          role: string
        }

        // Attach user data to socket
        socket.data.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        }

        next()
      } catch (error) {
        next(new Error("Invalid or expired token"))
      }
    })

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`)

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`)
      })
    })

    // Store the io instance on the server object
    res.socket.server.io = io
  }

  return NextResponse.json({ success: true })
}
