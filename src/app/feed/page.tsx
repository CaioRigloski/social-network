'use client'

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Post } from "@/components/Post/Post"
import { NewPostModal } from "@/components/Post/NewPostModal/NewPostModal"
import { FriendSuggestions } from "@/components/feed/FriendSuggestions/FriendSuggestions"
import { friendsFetcher, postsFetcher } from "@/lib/swr"
import useSWR from "swr"
import { FriendsAvatars } from "@/components/FriendsAvatars/FriendsAvatars"
import { ChatAccordion } from "@/components/Chat/ChatAccordion/ChatAccordion"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon } from "@radix-ui/react-icons"
import dynamic from "next/dynamic"
import { useChat } from "@/contexts/ChatContext/ChatContext"

const Chat = dynamic(() => import('@/components/Chat/Chat').then(mod => mod.Chat), { ssr: false })

export default function Feed() {
  const { chatId } = useChat()
  const friends = useSWR("/api/user/get-friends", friendsFetcher)
  const friendsIds = friends.data?.map(friend => friend.id)
  const postsData = useSWR(["/api/feed/get-posts", friendsIds], postsFetcher)

  return (
    <main className="grid grid-cols-[1fr_max-content_1fr] place-items-center relative max-h-fit pt-[5rem]">
      <div className="self-start sticky top-[10rem] flex flex-col gap-[5rem]">
        <FriendsAvatars/>
        <FriendSuggestions/>
      </div>
      <div className="grid auto-rows-auto grid-cols-1 justify-items-center gap-4 w-[35rem] self-start">
        <div className="flex flex-col w-full items-end">
          <Textarea placeholder="What's on your mind?" className="resize-none"/>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-fit place-self-end p-2" title="Add image">
                <ImageIcon width={25} height={25}/>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add image</AlertDialogTitle>
              </AlertDialogHeader>
              <NewPostModal/>
              <AlertDialogDescription>
                Show a incredible picture!
              </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
      { chatId && <Chat/> }
    </main>
  )
}