'use client'

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Post from "@/components/feed/Post"
import NewPost from "@/components/common/NewPost"

import useSWR from "swr"

import { signOutAction } from "./actions"
import { postsFetcher } from "@/lib/swr"
import FriendSuggestions from "@/components/feed/FriendsSugestions"


export default function Feed() {
  const postsData = useSWR("/api/feed/get-posts", postsFetcher)

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
      <FriendSuggestions/>
      <form action={signOutAction}>
        <Button type="submit">Sign Out</Button>
      </form>
    </main>
  )
}