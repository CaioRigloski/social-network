'use client'

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Post } from "@/components/Post/Post"
import { NewPostModal } from "@/components/Post/NewPostModal/NewPostModal"
import { FriendSuggestions } from "@/components/feed/FriendSuggestions/FriendSuggestions"
import { postsFetcher } from "@/lib/swr"
import useSWR from "swr"
import { FriendsAvatars } from "@/components/FriendsAvatars/FriendsAvatars"
import { useEffect, useRef, useState } from "react"


export default function Feed() {
  const postsRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState<number>(0)
  const postsData = useSWR("/api/feed/get-posts", postsFetcher)

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const scrollDirection = event.deltaY;

      if (postsRef.current) {
        if (scrollDirection > 0) {
          setScrollPosition(prev => prev + 30)
        } else if (scrollDirection < 0) {
          setScrollPosition(prev => prev - 30)
        }
      }
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    console.log(scrollPosition)
    if (postsRef.current) {
      postsRef.current.scrollTop = scrollPosition
    }
  }, [scrollPosition])
  
  return (
    <main className="grid grid-cols-[1fr_max-content_1fr] h-screen place-items-center pt-[5rem]">
      <div className="self-start">
        <FriendsAvatars/>
        <FriendSuggestions/>
      </div>
      <div ref={postsRef} className="grid auto-rows-auto grid-cols-1 justify-items-center gap-4 w-[37rem] h-screen overflow-y-scroll pt-2 self-start hide-scrollbar">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-fit place-self-end">Add post</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add post</AlertDialogTitle>
            </AlertDialogHeader>
            <NewPostModal/>
          </AlertDialogContent>
        </AlertDialog>
          {
            postsData?.data?.map(post => <Post key={"post" + post?.id} post={post}/>)
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
    </main>
  )
}