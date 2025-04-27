"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createOrder } from "@/lib/orders"
import type { Order } from "@/types/order"

interface OrderFormProps {
  onOrderCreated: (order: Order) => void
}

export function OrderForm({ onOrderCreated }: OrderFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    product: "",
    quantity: 1,
    location: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newOrder = await createOrder(formData)

      toast({
        title: "Order placed successfully",
        description: "Your order has been created and is waiting for a delivery partner",
      })

      // Reset form
      setFormData({
        product: "",
        quantity: 1,
        location: "",
      })

      // Notify parent component
      onOrderCreated(newOrder)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to place order",
        description: error instanceof Error ? error.message : "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <Input
          id="product"
          name="product"
          placeholder="Product name or ID"
          required
          value={formData.product}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          required
          value={formData.quantity}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Delivery Location</Label>
        <Textarea
          id="location"
          name="location"
          placeholder="Enter your delivery address"
          required
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  )
}
