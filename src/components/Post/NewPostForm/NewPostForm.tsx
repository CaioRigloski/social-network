'use client'


import { createNewPost } from "@/components/Post/actions"
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
import { useTranslations } from "next-intl"


export function NewPostForm(props: NewPostFormInterface) {
  const t = useTranslations()

  const [ inputImage, setInputImage ] = useState<File | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const newPostForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema)
  })

  async function mutatePostsData() {
    try {
      const newPostData = await createNewPost({
        picture: newPostForm.getValues("picture"),
        description: newPostForm.getValues("description")
      })

      mutate<PostInterface[]>(API_ROUTES.posts, data => {
        if (data && newPostData) return [newPostData, ...data]
      }, false)

      newPostForm.reset({
        description: "",
        picture: ""
      })
      setInputImage(undefined)
      props.onImageSelected(false)

      toast.success(t('post.succesfullyPublished'))
    } catch (err) {

      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error(t('common.unknownError'))
      }
    }
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setInputImage(file)
      newPostForm.setValue("picture", await toDataUrl(file))
      props.onImageSelected(true)
    } else {
      setInputImage(undefined)
      newPostForm.setValue("picture", "")
      props.onImageSelected(false)
    }
  }

  useEffect(() => {
    const pictureError = newPostForm.formState.errors.picture?.message
    const descriptionError = newPostForm.formState.errors.description?.message

    const message = pictureError || descriptionError
    if (message) {
      toast.error(message.toString())
    }
  }, [newPostForm.formState.errors.description, newPostForm.formState.errors.picture])

  const description = newPostForm.watch("description")
  const picture = newPostForm.watch("picture")

  const isSubmitDisabled = !description && !picture

  return (
    <Form {...newPostForm}>
      <form onSubmit={newPostForm.handleSubmit(async() => await mutatePostsData())} className="flex flex-col w-full items-end shadow-md p-2 bg-foreground text-color rounded-md" onMouseEnter={() => props.element(true)} onMouseLeave={() => props.element(false)}>
        <FormField
          control={newPostForm.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea placeholder={t('post.whatsOnYourMind')} className="resize-none focus:!ring-transparent text-black rounded-sm" {...field}/>
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="pt-2">
          <Button type="button" variant="ghost" className="w-fit h-fit place-self-end p-1" title={t('post.addImage')} onClick={openFileDialog}>
            <ImageIcon width={22} height={22} />
          </Button>
          <Button type="submit" variant="ghost" className="w-fit h-fit place-self-end p-1" disabled={isSubmitDisabled} title={t('post.publish')}>
            <PaperPlaneIcon width={22} height={22} />
          </Button>
        </div>
        
        <FormField
          control={newPostForm.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>
              </FormControl>
            </FormItem>
          )}
        />
        { inputImage && <Image src={URL.createObjectURL(inputImage)} width={500} height={500} alt="image" className="w-auto h-auto self-stretch"/> }
        <FormMessage/>
      </form>
    </Form>
  )
}