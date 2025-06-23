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
import { checkCredentials } from "@/app/[locale]/user/login/actions"
import { loginSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations()

  const router = useRouter()

  const searchParams = useSearchParams()
  const from = searchParams.get("from")

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  async function checkCredentialsAndRedirect(values: z.infer<typeof loginSchema>) {
    const res = await checkCredentials(values)

    if(res.success) {
      router.push(from || "/feed")
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-foreground text-color">
        <CardHeader>
          <CardTitle className="text-2xl">{ t('common.login') }</CardTitle>
          <CardDescription className="standard:text-color">
            { t('common.enterYourUsername') }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(checkCredentialsAndRedirect)} className="space-y-8" method="POST">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{ t('common.username') }</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} type="text" className="text-color-secondary"/>
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
                          <FormLabel>{ t('common.password') }</FormLabel>
                          <FormControl>
                            <Input placeholder="..." {...field} type="password" className="text-color-secondary"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  { t('common.login') }
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                { t('common.dontHaveAccount') }{" "}
                <Link href="/user/sign-up" className="underline underline-offset-4">
                  { t('common.signUp') }
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
