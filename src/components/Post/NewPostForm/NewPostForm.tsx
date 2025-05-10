'use client'


import { createNewPost } from "@/app/post/actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { newPostSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from "next/image"
import { z } from "zod"
import { useEffect, useRef, useState } from "react"
import { toDataUrl } from "@/lib/utils"
import { mutate } from "swr"
import PostInterface from "@/interfaces/post/post.interface"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, PaperPlaneIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import NewPostFormInterface from "@/interfaces/post/newPostForm/newPostForm.interface"
import { API_ROUTES } from "@/lib/apiRoutes"
import { toast } from "sonner"


export function NewPostForm(props: NewPostFormInterface) {
  const [ inputImage, setInputImage ] = useState<File | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const newPostForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      picture: "",
      description: ""
    }
  })

  async function mutatePostsData() {
    try {
      const newPostData = await createNewPost({
        picture: inputImage ? await toDataUrl(inputImage as File) : null,
        description: newPostForm.getValues("description")
      })

      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        if (data && newPostData) return [newPostData, ...data]
      }, false)

      newPostForm.reset()
      setInputImage(undefined)
      props.onImageSelected(false)

      toast("Succesfully published post")
    } catch (err) {

      if (err instanceof Error) {
        toast(err.message)
      } else {
        toast("An unknown error occurred.")
      }
    }
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

  useEffect(() => {
    if(newPostForm.formState.errors) {
      toast(newPostForm.formState.errors.picture?.message?.toString() || newPostForm.formState.errors.description?.message?.toString())
    }
  }, [newPostForm.formState.errors.description, newPostForm.formState.errors.picture])

  return (
    <Form {...newPostForm}>
      <form onSubmit={newPostForm.handleSubmit(async() => await mutatePostsData())} className="flex flex-col w-full items-end shadow-md p-2 bg-post text-post-color rounded-md" onMouseEnter={() => props.element(true)} onMouseLeave={() => props.element(false)}>
        <FormField
          control={newPostForm.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea placeholder="What's on your mind?" className="resize-none focus:!ring-transparent text-black rounded-sm" {...field}/>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="pt-2">
          <Button type="button" variant="ghost" className="w-fit h-fit place-self-end p-1" title="Add image" onClick={openFileDialog}>
            <ImageIcon width={22} height={22} />
          </Button>
          <Button type="submit" variant="ghost" className="w-fit h-fit place-self-end p-1">
            <PaperPlaneIcon width={22} height={22} />
          </Button>
        </div>
        
        <FormField
          control={newPostForm.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
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