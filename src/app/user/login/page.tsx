'use client'

import { LoginForm } from "@/components/LoginForm/LoginForm"
import { LoginParamsInterface } from "@/interfaces/params/user/login.interface"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function Login() {
  const session = useSession()
  const router = useRouter()

  const searchParams = useSearchParams() as LoginParamsInterface
  const status = searchParams.get("status")

  useEffect(() => {
    if(session.status === "authenticated") router.push("/feed")
  }, [session])

  if(session.status === "authenticated") return null

  useEffect(() => {
    if(status === "created") {
      toast("User succesfully created!", {
        description: "Login with your credentials"
      })
    }
  }, [status])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm/>
      </div>
    </div>
  )
}