'use client'

import Post from "@/components/feed/Post"
import { Button } from "@/components/ui/button"
import PostInterface from "@/interfaces/feed/post.interface"
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { useState } from "react"
import Image from "next/image"

import useSWR from "swr"
import { newFriendSchema, newPostSchema } from "./feed.types"
import { addNewFriend, createNewPost } from "./actions"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Separator } from "@/components/ui/separator"
import UserInterface from "@/interfaces/feed/user.interface"

const postsFetcher = (url: string): Promise<PostInterface[]> => fetch(url).then(r => r.json())
const friendsSuggestionFetcher = (url: string): Promise<UserInterface[]> => fetch(url).then(r => r.json())


export default function Feed() {
  const [ posts, setPosts ] = useState<PostInterface[]>()
  const [ inputImage, setInputImage ] = useState<File | undefined>(undefined)
  
  const newPostForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      picture: ""
    }
  })

  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
    defaultValues: {
      userId: 1,
    }
  })

  const postsData = useSWR("/api/feed/get-posts", postsFetcher, { refreshInterval: 1000 })
  const friendsSuggestionData = useSWR("/api/user/get-friend-suggestions", friendsSuggestionFetcher)
 
  return (
    <main className="grid grid-rows-[auto_1fr] grid-cols-1 h-screen">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-fit place-self-end">Add post</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add post</AlertDialogTitle>
          </AlertDialogHeader>
            <Form {...newPostForm}>
              <form onSubmit={newPostForm.handleSubmit(postData => createNewPost(postData, inputImage as File, 1))}>
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
                  <AlertDialogAction type="submit">Add</AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
        </AlertDialogContent>
      </AlertDialog>
      <div className="grid auto-rows-auto grid-cols-1">
        {
          postsData.data && postsData.data.map(post => <Post key={"post" + post.id} id={post.id} user={post.user} picture={post.picture}/>)
        }
        {
          postsData.data?.length === 0 || postsData.error &&
          <Alert>
            <AlertTitle>:(</AlertTitle>
            <AlertDescription>
              Não há postagens. Faça amigos e crie poasts para começar!
            </AlertDescription>
          </Alert>
        }
      </div>
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {friendsSuggestionData.data && friendsSuggestionData.data.map((suggestion) => 
            <div key={"suggestion" + suggestion.id}>
              <div className="text-sm">
                {suggestion.username}
              </div>
                <Button type="button" onClick={() => {addNewFriendForm.setValue("newFriendId", suggestion.id), addNewFriend(addNewFriendForm.getValues())}}>ADD</Button>
              <Separator className="my-2" />
            </div>
          )}
        </div>
      </ScrollArea>
    </main>
  )
}