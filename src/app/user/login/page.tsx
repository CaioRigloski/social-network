'use client'

import { LoginForm } from "@/components/LoginForm/LoginForm"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignIn() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if(session.status === "authenticated") router.push("/feed")
  }, [session])

  if(session.status === "authenticated") return null

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm/>
      </div>
    </div>
  )
}