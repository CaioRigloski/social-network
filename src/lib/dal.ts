
import { auth } from "@/app/api/auth/[nextauth]/route"
import { NextResponse } from "next/server"

export async function checkUserAuthorization(userId: string) {
  const session = await auth()

  if (!session || session.user.id !== userId) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return { authorized: true, session }
}