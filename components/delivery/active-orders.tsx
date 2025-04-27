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

interface ActiveOrdersProps {
  orders: Order[]
  isLoading: boolean
  onOrderStatusUpdated: (order: Order) => void
}

export function ActiveOrders({ orders, isLoading, onOrderStatusUpdated }: ActiveOrdersProps) {
  const { toast } = useToast()
  const [processingOrders, setProcessingOrders] = useState<Record<string, boolean>>({})

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setProcessingOrders((prev) => ({ ...prev, [orderId]: true }))

    try {
      const updatedOrder = await updateOrderStatus(orderId, status)

      toast({
        title: "Order updated",
        description: `Order status changed to ${status}`,
      })

      onOrderStatusUpdated(updatedOrder)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update order",
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
        <p className="text-muted-foreground">You don&apos;t have any active orders</p>
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
              <StatusBadge status={order.status} />
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
          <CardFooter className="flex justify-end gap-2 p-4 pt-0">
            {order.status === "Accepted" && (
              <Button
                onClick={() => handleUpdateStatus(order._id, "Out for Delivery")}
                disabled={processingOrders[order._id]}
              >
                {processingOrders[order._id] ? "Updating..." : "Mark as Out for Delivery"}
              </Button>
            )}

            {order.status === "Out for Delivery" && (
              <Button onClick={() => handleUpdateStatus(order._id, "Delivered")} disabled={processingOrders[order._id]}>
                {processingOrders[order._id] ? "Updating..." : "Mark as Delivered"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "outline" | "destructive" = "outline"

  switch (status) {
    case "Pending":
      variant = "outline"
      break
    case "Accepted":
      variant = "secondary"
      break
    case "Out for Delivery":
      variant = "default"
      break
    case "Delivered":
      variant = "default"
      break
    default:
      variant = "outline"
  }

  return <Badge variant={variant}>{status}</Badge>
}
