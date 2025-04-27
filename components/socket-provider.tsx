"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "@/hooks/use-auth"

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Only connect to socket if user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Initialize the Socket.io API route
    fetch("/api/socket").catch(console.error)

    // Create socket connection
    const socketInstance = io({
      path: "/api/socket",
      auth: {
        token: localStorage.getItem("auth-token"),
      },
    })

    // Set up event listeners
    socketInstance.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    // Save socket instance
    setSocket(socketInstance)

    // Clean up on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
