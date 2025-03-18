'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Post } from "@/components/Post/Post"
import { FriendSuggestions } from "@/components/feed/FriendSuggestions/FriendSuggestions"
import { friendsFetcher, postsFetcher } from "@/lib/swr"
import useSWR from "swr"
import { FriendsAvatars } from "@/components/FriendsAvatars/FriendsAvatars"
import { ChatAccordion } from "@/components/Chat/ChatAccordion/ChatAccordion"
import dynamic from "next/dynamic"
import { useChat } from "@/contexts/ChatContext/ChatContext"
import { NewPostForm } from "@/components/Post/NewPostForm/NewPostForm"
import { useEffect, useState } from "react"
import { API_ROUTES } from "@/lib/apiRoutes"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const Chat = dynamic(() => import('@/components/Chat/Chat').then(mod => mod.Chat), { ssr: false })

export default function Feed() {
  const router = useRouter()
  const session = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/user/login")
    }
  })

  if(session.status === "loading") return <div>Loading...</div>

  const { chatId } = useChat()
  const friends = useSWR(API_ROUTES.user.getFriends, friendsFetcher)
  const friendsIds = friends?.data?.map(friend => friend.id)
  const postsData = useSWR(
    friendsIds ? API_ROUTES.feed.getPosts : null,
    () => postsFetcher(API_ROUTES.feed.getPosts, friendsIds),
  )
  
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
      <div className="grid auto-rows-auto grid-cols-1 justify-items-center gap-4 w-[35rem] self-start">
        <NewPostForm onImageSelected={handleImageSelected} element={handlePostFormHover}/>
        {
          postsData?.data?.map(post => <Post key={"post" + post?.id} post={post} className={getImageClass()}/>)
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
      <div className={`self-start sticky top-[10rem] ${getImageClass()}`}>
        <ChatAccordion/>
      </div>
      { chatId && <Chat/> }
    </main>
  )
}