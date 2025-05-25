"use client"

import { FilterIcon, SearchIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Switch } from "../ui/switch"
import { Separator } from "../ui/separator"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import { searchSchema } from "@/lib/zod"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


export function SearchInputForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
      posts: true,
      users: true,
    },
  })

  function onSubmit(values: z.infer<typeof searchSchema>) {
    router.push(`/search?query=${values.query}&posts=${values.posts}&users=${values.users}`)
  }

  useEffect(() => {
    const postsError = form.formState.errors.posts?.message
    const usersError = form.formState.errors.users?.message
    const queryError = form.formState.errors.query?.message

    const message = postsError || usersError || queryError
    if (message) {
      toast.error(message.toString())
    }
  }, [form.formState.errors.posts, form.formState.errors.users, form.formState.errors.query])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative w-fit">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Search"
                  {...field}
                  className="w-64 h-8 outline-none standard:border-foreground border-[1.5px] focus:border-2 standard:text-color-secondary"
                  style={{ boxShadow: "revert" }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 h-fit leading-none flex gap-1">
          <Button
            type="submit"
            className="bg-transparent h-fit w-fit p-0 m-0 hover:bg-transparent"
          >
            <SearchIcon
              width={22}
              height={22}
              className="text-foreground hover:text-color-secondary"
            />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                className="bg-transparent h-fit w-fit p-0 m-0 hover:bg-transparent"
              >
                <FilterIcon
                  width={22}
                  height={22}
                  className="text-foreground hover:text-color-secondary"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm w-36 p-3">
              <ul className="flex flex-col gap-2">
                <li className="grid grid-cols-2 place-items-center">
                  <p>Posts</p>
                  <FormField
                    control={form.control}
                    name="posts"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        size="sm"
                        className="data-[state=checked]:!bg-foreground"
                      />
                    )}
                  />
                </li>
                <Separator />
                <li className="grid grid-cols-2 place-items-center">
                  <p>Users</p>
                  <FormField
                    control={form.control}
                    name="users"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        size="sm"
                        className="data-[state=checked]:!bg-foreground"
                      />
                    )}
                  />
                </li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </form>
    </Form>
  )
}
