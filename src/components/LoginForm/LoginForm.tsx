'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { checkCredentials } from "@/app/user/login/actions"
import { loginSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import Link from "next/link"
import { Alert, AlertTitle, AlertDescription } from "../ui/alert"
import { LoginParamsInterface } from "@/interfaces/params/user/login.interface"
import { useSearchParams } from "next/navigation"
import { Toaster } from "../ui/sonner"
import { useEffect } from "react"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams() as LoginParamsInterface
  const status = searchParams.get("status")

  const session = useSession()

  useEffect(() => {
    if(status === "created") {
      toast("User succesfully created!", {
        description: "Login with your credentials"
      })
    }
  }, [])

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  async function updateSessionAndReload(values: z.infer<typeof loginSchema>) {
    await checkCredentials(values)
    await session.update()
    window.location.reload()
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username below to Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
          <form onSubmit={form.handleSubmit( async (values) => { updateSessionAndReload(values) } )} className="space-y-8" method="POST">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} type="text"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="..." {...field} type="password"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/user/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
          <Toaster/>
        </CardContent>
      </Card>
    </div>
  )
}
