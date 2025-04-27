import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (role !== "customer" && role !== "delivery") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    })

    await newUser.save()

    // Return success response (without password)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
