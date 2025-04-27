import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Order from "@/models/order"
import { verifyAuth } from "@/lib/auth-middleware"
import { getSocketIO } from "@/lib/socket-server"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Verify user is a customer
    if (authResult.role !== "customer") {
      return NextResponse.json({ error: "Only customers can create orders" }, { status: 403 })
    }

    // Parse request body
    const { product, quantity, location } = await request.json()

    // Validate input
    if (!product || !quantity || !location) {
      return NextResponse.json({ error: "Product, quantity, and location are required" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Create new order
    const newOrder = new Order({
      customerId: authResult.userId,
      product,
      quantity,
      location,
      status: "Pending",
    })

    await newOrder.save()

    // Emit socket event for new order
    const io = getSocketIO()
    if (io) {
      io.emit("newOrder", newOrder)
    }

    // Return success response
    return NextResponse.json(
      {
        message: "Order created successfully",
        order: newOrder,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
