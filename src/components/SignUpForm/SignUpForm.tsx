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
import { signUpSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import Link from "next/link"
import { createUser } from "@/app/[locale]/user/sign-up/actions"
import { useTranslations } from "next-intl"


export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-foreground text-color">
        <CardHeader>
          <CardTitle className="text-2xl">{ t('common.signUp') }</CardTitle>
          <CardDescription className="standard:text-color">
            { t('common.enterYourUsernameSignUp') }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
          <form onSubmit={ form.handleSubmit(data => createUser(JSON.parse(JSON.stringify(data)))) } className="space-y-8" method="POST">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ t('common.username') }</FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} type="text" className="text-color-secondary"/>
                      </FormControl>
                      <FormDescription className="standard:text-color">
                        { t('common.publicDisplayName') }
                      </FormDescription>
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
                  { t('common.signUp') }
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                { t('common.haveAnAccount') }{" "}
                <Link href="/user/login" className="underline underline-offset-4">
                  { t('common.login') }
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
