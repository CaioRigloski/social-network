'use client'

import { LoginForm } from "@/components/LoginForm/LoginForm"
import { LoginParamsInterface } from "@/interfaces/params/user/login.interface"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function Login() {
  const searchParams = useSearchParams() as LoginParamsInterface
  const status = searchParams.get("status")

  useEffect(() => {
    if(status === "created") {
      toast.success("User succesfully created!", {
        description: "Login with your credentials"
      })
    }
  }, [status])

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm/>
      </div>
    </main>
  )
}