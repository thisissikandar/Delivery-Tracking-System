"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import type { Order } from "@/types/order"

interface OrderHistoryProps {
  orders: Order[]
  isLoading: boolean
}

export function OrderHistory({ orders, isLoading }: OrderHistoryProps) {
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
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don&apos;t have any completed orders yet</p>
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
                <p className="text-sm text-muted-foreground">Completed on {formatDate(order.updatedAt)}</p>
              </div>
              <Badge variant="default">Delivered</Badge>
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
                <div className="text-sm text-muted-foreground">Delivery Partner:</div>
                <div className="text-sm font-medium">
                  {typeof order.deliveryPartnerId === "object" ? order.deliveryPartnerId.name : "Unknown"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Order Date:</div>
                <div className="text-sm font-medium">{formatDate(order.createdAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
