"use client"

import type { User } from "@/types/user"

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: string
}

export async function login(data: LoginData): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to login")
  }

  const { user, token } = await response.json()

  // Store token in localStorage
  localStorage.setItem("auth-token", token)

  return user
}

export async function register(data: RegisterData): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to register")
  }
}

export async function getCurrentUser(): Promise<User | null> {
  // Get token from localStorage
  const token = localStorage.getItem("auth-token")

  if (!token) {
    return null
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get current user")
    }

    const { user } = await response.json()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem("auth-token")
}
