"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { updateOrderStatus } from "@/lib/orders"
import { formatDate } from "@/lib/utils"
import type { Order } from "@/types/order"

interface PendingOrdersProps {
  orders: Order[]
  isLoading: boolean
  onOrderAccepted: (order: Order) => void
}

export function PendingOrders({ orders, isLoading, onOrderAccepted }: PendingOrdersProps) {
  const { toast } = useToast()
  const [processingOrders, setProcessingOrders] = useState<Record<string, boolean>>({})

  const handleAcceptOrder = async (orderId: string) => {
    setProcessingOrders((prev) => ({ ...prev, [orderId]: true }))

    try {
      const updatedOrder = await updateOrderStatus(orderId, "Accepted")

      toast({
        title: "Order accepted",
        description: "You have successfully accepted this order",
      })

      onOrderAccepted(updatedOrder)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to accept order",
        description: error instanceof Error ? error.message : "Please try again later",
      })
    } finally {
      setProcessingOrders((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end p-4 pt-0">
              <Skeleton className="h-10 w-[100px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pending orders available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Order #{order._id.slice(-6)}</h3>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>

            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Product:</div>
                <div className="text-sm font-medium">{order.product}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Quantity:</div>
                <div className="text-sm font-medium">{order.quantity}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Location:</div>
                <div className="text-sm font-medium">{order.location}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Customer:</div>
                <div className="text-sm font-medium">
                  {typeof order.customerId === "object" ? order.customerId.name : "Customer"}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-4 pt-0">
            <Button onClick={() => handleAcceptOrder(order._id)} disabled={processingOrders[order._id]}>
              {processingOrders[order._id] ? "Accepting..." : "Accept Order"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
