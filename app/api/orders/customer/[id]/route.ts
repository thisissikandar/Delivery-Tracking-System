import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Order from "@/models/order"
import { verifyAuth } from "@/lib/auth-middleware"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const customerId = params.id

    // Verify user is accessing their own orders or is an admin
    if (authResult.userId !== customerId && authResult.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Connect to database
    await connectToDatabase()

    // Fetch customer orders
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 }).populate("deliveryPartnerId", "name")

    // Return orders
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Fetch customer orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
