'use client'


import { createNewPost } from "@/app/post/actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { newPostSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "../../ui/input"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "../../ui/alert-dialog"
import Image from "next/image"
import { z } from "zod"
import { useState } from "react"
import { toDataUrl } from "@/lib/utils"
import { mutate } from "swr"
import PostInterface from "@/interfaces/feed/post.interface"


export function NewPostModal() {
  const [ inputImage, setInputImage ] = useState<File | undefined>(undefined)

  const newPostForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      picture: ""
    }
  })

  async function mutatePostsData() {
    const newPostData = await createNewPost({picture: await toDataUrl(inputImage as File)})
    
    mutate<PostInterface[]>("/api/feed/get-posts", data => {
      if (data && newPostData) return [...data, newPostData]
    }, false)
  }

  return (
    <Form {...newPostForm}>
      <form onSubmit={newPostForm.handleSubmit(async() => await mutatePostsData())}>
        <FormField
          control={newPostForm.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Picture</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" {...field} onChange={e => setInputImage(e.target.files?.[0])}/>
              </FormControl>
            </FormItem>
          )}
        />
        {inputImage && <Image src={URL.createObjectURL(inputImage)} width={500} height={500} alt="image"/>}
        <FormMessage/>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction type="submit" disabled={!inputImage}>Add</AlertDialogAction>
        </AlertDialogFooter>
      </form>
    </Form>
  )
}