'use client'


import { createNewPost } from "@/app/post/actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { newPostSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from "next/image"
import { z } from "zod"
import { useRef, useState } from "react"
import { toDataUrl } from "@/lib/utils"
import { mutate } from "swr"
import PostInterface from "@/interfaces/feed/post.interface"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"


export function NewPostForm(props: {onImageSelected: (hasImage: boolean) => void, element: (isOnHover: boolean) => void}) {
  const [ inputImage, setInputImage ] = useState<File | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setInputImage(file)
      props.onImageSelected(true)
    } else {
      setInputImage(undefined)
      props.onImageSelected(false)
    }
  }

  return (
    <Form {...newPostForm}>
      <form onSubmit={newPostForm.handleSubmit(async() => await mutatePostsData())} className="flex flex-col w-full items-end shadow-md p-2" onMouseEnter={() => props.element(true)} onMouseLeave={() => props.element(false)}>
        <FormField
          control={newPostForm.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea placeholder="What's on your mind?" className="resize-none focus:!ring-transparent" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="button" variant="ghost" className="w-fit place-self-end p-2" title="Add image" onClick={openFileDialog}>
          <ImageIcon width={25} height={25} />
        </Button>
        
        <FormField
          control={newPostForm.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Picture</FormLabel>
              <FormControl>
                <input type="file" accept="image/*" {...field} ref={fileInputRef} onChange={e => handleImageChange(e)} className="hidden"/>
              </FormControl>
            </FormItem>
          )}
        />
        {inputImage && <Image src={URL.createObjectURL(inputImage)} width={500} height={500} alt="image" className="w-auto h-auto"/>}
        <FormMessage/>
      </form>
    </Form>
  )
}