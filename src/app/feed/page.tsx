'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Post } from "@/components/Post/Post"
import { FriendSuggestions } from "@/components/FriendSuggestions/FriendSuggestions"
import { postsFetcher } from "@/lib/swr"
import useSWR from "swr"
import { FriendsAvatars } from "@/components/FriendsAvatars/FriendsAvatars"
import { ChatAccordion } from "@/components/Chat/ChatAccordion/ChatAccordion"
import dynamic from "next/dynamic"
import { useChat } from "@/contexts/ChatContext/ChatContext"
import { NewPostForm } from "@/components/Post/NewPostForm/NewPostForm"
import { useState } from "react"
import { API_ROUTES } from "@/lib/apiRoutes"


const Chat = dynamic(() => import('@/components/Chat/Chat').then(mod => mod.Chat), { ssr: false })

export default function Feed() {
  const { chatId } = useChat()

  const postsData = useSWR(API_ROUTES.posts, postsFetcher)
  
  const [ hasImage, setHasImage ] = useState<boolean>(false)
  const [isOnHover, setIsOnHover ] = useState<boolean>(false)

  function handleImageSelected(hasImage: boolean) {
    setHasImage(hasImage)
  }

  function handlePostFormHover(isOnHover: boolean) {
    setIsOnHover(isOnHover)
  }

  function getImageClass() {
    return `${hasImage && isOnHover ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300 ease-in-out`;
  }

  return (
    <main className="grid grid-cols-[1fr_max-content_1fr] place-items-center relative max-h-fit pt-[5rem]">
      <div className={`self-start sticky top-[10rem] flex flex-col gap-[5rem] ${getImageClass()}`}>
        <FriendsAvatars/>
        <FriendSuggestions/>
      </div>
      <div className="grid auto-rows-auto grid-cols-1 justify-items-center gap-10 w-[var(--post-width)] self-start">
        <NewPostForm onImageSelected={handleImageSelected} element={handlePostFormHover}/>
        {
          postsData?.data?.map(post => <Post key={"post" + post?.id} post={post} swrKey={API_ROUTES.posts} className={`${getImageClass()}`}/>)
        }
        {
          postsData.data && postsData.data?.length > 0 && <p className="p-5 text-gray-300">No more posts.</p>
        }
        {
          postsData.data?.length === 0 && !postsData.error &&
          <Alert className="bg-foreground text-color">
            <AlertTitle>:&#40;</AlertTitle>
            <AlertDescription>
              There&apos;s no posts. Make friends and add some posts!
            </AlertDescription>
          </Alert>
        }
        {
          postsData.error &&
          <Alert className="bg-foreground text-color">
            <AlertTitle>:&#40;</AlertTitle>
            <AlertDescription>
              Error. Please contact the administrator.
            </AlertDescription>
          </Alert>
        }
      </div>
      <div className={`self-start sticky top-[10rem] ${getImageClass()}`}>
        <ChatAccordion/>
      </div>
      { chatId && <Chat/> }
    </main>
  )
}