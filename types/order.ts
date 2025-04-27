import type { User } from "./user"

export interface Order {
  _id: string
  customerId: string | User
  deliveryPartnerId?: string | User
  product: string
  quantity: number
  status: "Pending" | "Accepted" | "Out for Delivery" | "Delivered"
  location: string
  createdAt: string
  updatedAt: string
}
