"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useSocket } from "@/hooks/use-socket"
import { DeliveryHeader } from "@/components/delivery/delivery-header"
import { PendingOrders } from "@/components/delivery/pending-orders"
import { ActiveOrders } from "@/components/delivery/active-orders"
import { CompletedOrders } from "@/components/delivery/completed-orders"
import { fetchPendingOrders, fetchDeliveryPartnerOrders } from "@/lib/orders"
import type { Order } from "@/types/order"

export default function DeliveryDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const { socket } = useSocket()
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in or not a delivery partner
    if (!authLoading && (!user || user.role !== "delivery")) {
      router.push("/login")
      return
    }

    if (user) {
      loadOrders()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (socket && user) {
      // Listen for new orders
      socket.on("newOrder", (newOrder: Order) => {
        setPendingOrders((prev) => [newOrder, ...prev])

        toast({
          title: "New Order Available",
          description: `New order #${newOrder._id.slice(-6)} is available for pickup`,
        })
      })

      // Listen for order updates
      socket.on("orderUpdated", (updatedOrder: Order) => {
        // Update pending orders list
        setPendingOrders((prev) => prev.filter((order) => order._id !== updatedOrder._id))

        // Update my orders list
        if (updatedOrder.deliveryPartnerId === user._id) {
          setMyOrders((prev) => prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))
        }
      })

      return () => {
        socket.off("newOrder")
        socket.off("orderUpdated")
      }
    }
  }, [socket, user, toast])

  const loadOrders = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const [pendingData, myOrdersData] = await Promise.all([
        fetchPendingOrders(),
        fetchDeliveryPartnerOrders(user._id),
      ])

      setPendingOrders(pendingData)
      setMyOrders(myOrdersData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load orders",
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderAccepted = (acceptedOrder: Order) => {
    // Remove from pending orders
    setPendingOrders((prev) => prev.filter((order) => order._id !== acceptedOrder._id))

    // Add to my orders
    setMyOrders((prev) => [acceptedOrder, ...prev])
  }

  const handleOrderStatusUpdated = (updatedOrder: Order) => {
    setMyOrders((prev) => prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <DeliveryHeader />

      <main className="container py-6 space-y-6">
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Orders</TabsTrigger>
            <TabsTrigger value="active">My Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Orders</CardTitle>
                <CardDescription>Orders waiting for a delivery partner</CardDescription>
              </CardHeader>
              <CardContent>
                <PendingOrders orders={pendingOrders} isLoading={isLoading} onOrderAccepted={handleOrderAccepted} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>My Active Orders</CardTitle>
                <CardDescription>Orders you are currently delivering</CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveOrders
                  orders={myOrders.filter((order) => order.status !== "Delivered")}
                  isLoading={isLoading}
                  onOrderStatusUpdated={handleOrderStatusUpdated}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Orders</CardTitle>
                <CardDescription>Orders you have successfully delivered</CardDescription>
              </CardHeader>
              <CardContent>
                <CompletedOrders
                  orders={myOrders.filter((order) => order.status === "Delivered")}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
