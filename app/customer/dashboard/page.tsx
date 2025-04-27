"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useSocket } from "@/hooks/use-socket"
import { CustomerHeader } from "@/components/customer/customer-header"
import { OrderForm } from "@/components/customer/order-form"
import { OrdersList } from "@/components/customer/orders-list"
import { OrderHistory } from "@/components/customer/order-history"
import { fetchCustomerOrders } from "@/lib/orders"
import type { Order } from "@/types/order"

export default function CustomerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const { socket } = useSocket()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in or not a customer
    if (!authLoading && (!user || user.role !== "customer")) {
      router.push("/login")
      return
    }

    if (user) {
      loadOrders()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (socket && user) {
      // Listen for order updates
      socket.on("orderUpdated", (updatedOrder: Order) => {
        setOrders((prevOrders) => prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))

        toast({
          title: "Order Updated",
          description: `Order #${updatedOrder._id.slice(-6)} status changed to ${updatedOrder.status}`,
        })
      })

      return () => {
        socket.off("orderUpdated")
      }
    }
  }, [socket, user, toast])

  const loadOrders = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await fetchCustomerOrders(user._id)
      setOrders(data)
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

  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev])
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />

      <main className="container py-6 space-y-6">
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="new-order">Place Order</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Orders</CardTitle>
                <CardDescription>Track your active orders in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersList orders={orders.filter((order) => order.status !== "Delivered")} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-order">
            <Card>
              <CardHeader>
                <CardTitle>Place a New Order</CardTitle>
                <CardDescription>Fill in the details to create a new delivery order</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderForm onOrderCreated={handleOrderCreated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders and their details</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderHistory orders={orders.filter((order) => order.status === "Delivered")} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
