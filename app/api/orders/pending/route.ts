import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Order from "@/models/order"
import { verifyAuth } from "@/lib/auth-middleware"

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Verify user is a delivery partner
    if (authResult.role !== "delivery") {
      return NextResponse.json({ error: "Only delivery partners can access pending orders" }, { status: 403 })
    }

    // Connect to database
    await connectToDatabase()

    // Fetch pending orders
    const pendingOrders = await Order.find({
      status: "Pending",
      deliveryPartnerId: { $exists: false },
    }).populate("customerId", "name")

    // Return pending orders
    return NextResponse.json(pendingOrders)
  } catch (error) {
    console.error("Fetch pending orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
