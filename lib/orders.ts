"use client"

import type { Order } from "@/types/order"

interface CreateOrderData {
  product: string
  quantity: number
  location: string
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const token = localStorage.getItem("auth-token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create order")
  }

  const { order } = await response.json()
  return order
}

export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  const token = localStorage.getItem("auth-token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`/api/orders/customer/${customerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch orders")
  }

  return response.json()
}

export async function fetchPendingOrders(): Promise<Order[]> {
  const token = localStorage.getItem("auth-token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch("/api/orders/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch pending orders")
  }

  return response.json()
}

export async function fetchDeliveryPartnerOrders(deliveryPartnerId: string): Promise<Order[]> {
  const token = localStorage.getItem("auth-token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`/api/orders/delivery/${deliveryPartnerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch orders")
  }

  return response.json()
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const token = localStorage.getItem("auth-token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update order status")
  }

  return response.json()
}

export async function fetchOrderHistory(userId: string): Promise<Order[]> {
  const token = localStorage.getItem("auth-token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(`/api/orders/history/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch order history")
  }

  return response.json()
}
