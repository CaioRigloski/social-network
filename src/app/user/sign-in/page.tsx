'use client'

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema } from "@/lib/zod";
import { checkCredentials } from "./actions";
import { useSession } from "next-auth/react";

export default function SignIn() {
  const session = useSession()

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  async function updateSessionAndReload(values: z.infer<typeof signInSchema>) {
    await checkCredentials(values)
    await session.update()
    window.location.reload()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit( async (values) => { updateSessionAndReload(values) } )} className="space-y-8" method="POST">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="..." {...field} type="text"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="..." {...field} type="password"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}