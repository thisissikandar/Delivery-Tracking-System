import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Order from "@/models/order"
import { verifyAuth } from "@/lib/auth-middleware"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const userId = params.userId

    // Verify user is accessing their own history
    if (authResult.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Connect to database
    await connectToDatabase()

    // Fetch order history based on user role
    let orders
    if (authResult.role === "customer") {
      orders = await Order.find({
        customerId: userId,
        status: "Delivered",
      })
        .sort({ updatedAt: -1 })
        .populate("deliveryPartnerId", "name")
    } else if (authResult.role === "delivery") {
      orders = await Order.find({
        deliveryPartnerId: userId,
        status: "Delivered",
      })
        .sort({ updatedAt: -1 })
        .populate("customerId", "name")
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 })
    }

    // Return order history
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Fetch order history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
