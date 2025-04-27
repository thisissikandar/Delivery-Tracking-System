import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"
import { verifyAuth } from "@/lib/auth-middleware"

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Connect to database
    await connectToDatabase()

    // Get user data
    const user = await User.findById(authResult.userId).select("-password")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
