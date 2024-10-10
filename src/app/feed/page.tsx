'use client'

import Post from "@/components/feed/Post"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import useSWR from "swr"

import { newFriendSchema } from "@/lib/zod"
import { sendFriendRequest, signOutAction } from "./actions"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { friendsSuggestionsFetcher, postsFetcher } from "@/lib/swr"
import NewPost from "@/components/common/NewPost"


export default function Feed() {
  const postsData = useSWR("/api/feed/get-posts", postsFetcher)
  const friendsSuggestions = useSWR("/api/user/get-friend-suggestions", friendsSuggestionsFetcher)

  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

  async function mutateFriendsSuggestions(newFriendId: string) {
    addNewFriendForm.setValue("newFriendId", newFriendId)
    await sendFriendRequest(addNewFriendForm.getValues())
    friendsSuggestions.mutate(friendsSuggestions.data)
  }
  
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
          <NewPost/>
        </AlertDialogContent>
      </AlertDialog>
      <div className="grid auto-rows-auto grid-cols-1">
        {
          postsData?.data?.map(post => <Post key={"post" + post.id} id={post.id} user={post.user} picture={post.picture}/>)
        }
        {
          postsData.data?.length === 0 && !postsData.error &&
          <Alert>
            <AlertTitle>:(</AlertTitle>
            <AlertDescription>
              There's no posts. Make friends and add some posts!
            </AlertDescription>
          </Alert>
        }
        {
          postsData.error &&
          <Alert>
            <AlertTitle>:(</AlertTitle>
            <AlertDescription>
              Error. Please contact the administrator.
            </AlertDescription>
          </Alert>
        }
        
      </div>
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Friend suggestions</h4>
          {
            friendsSuggestions.data?.map((suggestion) => 
              <div key={"suggestion" + suggestion.id}>
                <div className="text-sm">
                  {suggestion.username}
                </div>
                <Button type="button" onClick={() => mutateFriendsSuggestions(suggestion.id)}>ADD</Button>
                <Separator className="my-2" />
              </div>
            )}
        </div>
      </ScrollArea>
      <form action={signOutAction}>
        <Button type="submit">Sign Out</Button>
      </form>
    </main>
  )
}