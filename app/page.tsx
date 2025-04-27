import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Delivery Management System</h1>
        <p className="text-lg text-muted-foreground">
          A real-time delivery tracking platform for customers and delivery partners
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
