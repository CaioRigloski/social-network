'use client'

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Post } from "@/components/Post/Post"
import { NewPostModal } from "@/components/Post/NewPostModal/NewPostModal"
import { FriendSuggestions } from "@/components/feed/FriendSuggestions/FriendSuggestions"
import { postsFetcher } from "@/lib/swr"
import useSWR from "swr"
import { FriendsAvatars } from "@/components/FriendsAvatars/FriendsAvatars"
import { Chat } from "@/components/Chat/Chat"
import { ChatAccordion } from "@/components/Chat/ChatAccordion/ChatAccordion"


export default function Feed() {
  const postsData = useSWR("/api/feed/get-posts", postsFetcher)

  return (
    <main className="grid grid-cols-[1fr_max-content_1fr] place-items-center relative max-h-fit pt-[5rem]">
      <div className="self-start sticky top-[10rem] flex flex-col gap-[5rem]">
        <FriendsAvatars/>
        <FriendSuggestions/>
      </div>
      <div className="grid auto-rows-auto grid-cols-1 justify-items-center gap-4 w-[35rem] self-start">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-fit place-self-end">Add post</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add post</AlertDialogTitle>
            </AlertDialogHeader>
            <NewPostModal/>
            <AlertDialogDescription>
              Add a new post to your feed.
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
        {
          postsData?.data?.map(post => <Post key={"post" + post?.id} post={post}/>)
        }
        {
          postsData.data && postsData.data?.length > 0 && <p className="p-5 text-gray-300">No more posts.</p>
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
      <div className="self-start sticky top-[10rem]">
        <ChatAccordion/>
      </div>
      <Chat/>
    </main>
  )
}