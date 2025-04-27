"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import type { Order } from "@/types/order"

interface OrdersListProps {
  orders: Order[]
  isLoading: boolean
}

export function OrdersList({ orders, isLoading }: OrdersListProps) {
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

              {order.deliveryPartnerId && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Delivery Partner:</div>
                  <div className="text-sm font-medium">
                    {typeof order.deliveryPartnerId === "object" ? order.deliveryPartnerId.name : "Assigned"}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
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
