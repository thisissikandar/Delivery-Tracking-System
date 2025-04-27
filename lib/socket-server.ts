import { Server as SocketIOServer } from "socket.io"
import type { Server as NetServer } from "http"
import jwt from "jsonwebtoken"

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

let io: SocketIOServer | null = null

export function initSocketServer(server: NetServer) {
  if (io) return io

  io = new SocketIOServer(server, {
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

  return io
}

export function getSocketIO() {
  // For Vercel deployment, we'll use a different approach
  if (process.env.NODE_ENV === "production") {
    // In production, we'll use a global variable to access the socket server
    // This is handled by the /api/socket route
    return global.io || null
  }

  return io
}
