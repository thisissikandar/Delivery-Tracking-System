"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/types/user"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const logout = () => {
    // Clear user from state
    setUser(null)

    // Clear token from localStorage
    localStorage.removeItem("auth-token")

    // Redirect to login page
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>{children}</AuthContext.Provider>
}
