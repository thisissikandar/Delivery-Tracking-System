import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Order from "@/models/order"
import { verifyAuth } from "@/lib/auth-middleware"
import { getSocketIO } from "@/lib/socket-server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const orderId = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ["Pending", "Accepted", "Out for Delivery", "Delivered"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Find order
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check permissions
    if (authResult.role === "delivery") {
      // For "Accepted" status, assign the delivery partner
      if (status === "Accepted" && order.status === "Pending") {
        order.deliveryPartnerId = authResult.userId
      }
      // For other statuses, verify this delivery partner owns the order
      else if (order.deliveryPartnerId && order.deliveryPartnerId.toString() !== authResult.userId) {
        return NextResponse.json({ error: "You are not assigned to this order" }, { status: 403 })
      }
    } else if (authResult.role === "customer") {
      // Customers can only view their own orders, not update status
      if (order.customerId.toString() !== authResult.userId) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
      }

      return NextResponse.json({ error: "Customers cannot update order status" }, { status: 403 })
    }

    // Update order status
    order.status = status
    await order.save()

    // Populate delivery partner info for the response
    await order.populate("deliveryPartnerId", "name")
    await order.populate("customerId", "name")

    // Emit socket event for order update
    const io = getSocketIO()
    if (io) {
      io.emit("orderUpdated", order)
    }

    // Return updated order
    return NextResponse.json(order)
  } catch (error) {
    console.error("Update order status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
