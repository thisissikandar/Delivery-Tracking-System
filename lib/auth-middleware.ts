import jwt from "jsonwebtoken"

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface AuthResult {
  success: boolean
  userId?: string
  role?: string
  error?: string
  status?: number
}

export async function verifyAuth(request: Request): Promise<AuthResult> {
  // Get token from Authorization header
  const authHeader = request.headers.get("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      error: "Authentication required",
      status: 401,
    }
  }

  const token = authHeader.split(" ")[1]

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }

    return {
      success: true,
      userId: decoded.userId,
      role: decoded.role,
    }
  } catch (error) {
    return {
      success: false,
      error: "Invalid or expired token",
      status: 401,
    }
  }
}
