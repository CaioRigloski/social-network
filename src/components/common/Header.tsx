'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import NotificationCount from "../NotificationCount"
import useSWR, { mutate } from "swr"
import { friendsRequestsFetcher } from "@/lib/swr"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { newFriendSchema } from "@/lib/zod"
import { Separator } from "@radix-ui/react-separator"
import { acceptFriendRequest, signOutAction } from "@/app/feed/actions"
import { useSession } from "next-auth/react"
import PostInterface from "@/interfaces/feed/post.interface"
import { Button } from "../ui/button"


export default function Header() {
  const session = useSession()

  const friendRequests = useSWR("/api/user/get-friend-requests", friendsRequestsFetcher)

  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

  async function mutateFriendRequests(newFriendId: string) {
    addNewFriendForm.setValue("newFriendId", newFriendId)
    await acceptFriendRequest(addNewFriendForm.getValues())
    friendRequests.mutate(friendRequests.data?.filter(user => user.id ! == newFriendId))

    const newFriendPostsResult = await fetch(`/api/user/get-posts?id=${newFriendId}`)
    const newFriendPosts: PostInterface[] =  await newFriendPostsResult.json()
 
    mutate("/api/feed/get-posts", (data: any) => [...data, newFriendPosts.forEach(post => {return post})], { populateCache: true })
  }

  return (
    <header>
      <div className="relative mt-8 flex items-center justify-end gap-x-4">
        <img src="" alt="" className="h-10 w-10 rounded-full bg-gray-50"/>
        <div className="text-sm leading-6">
          <p className="font-semibold text-gray-900">
            <Link href="/user/profile">
              <>
                <span className="absolute inset-0"></span>
                {session.status === "authenticated" && session.data.user?.username}
              </>
            </Link>
          </p>
        </div>
      </div>
      <form className="flex justify-end" action={signOutAction}>
        <Button type="submit">Sign Out</Button>
      </form>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/feed" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Feed</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/user/friends" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Friends list</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <p>Friend requests</p>
              <NotificationCount count={friendRequests.data ? friendRequests.data.length : 0}></NotificationCount>
              <NavigationMenuContent>
                {
                  friendRequests?.data?.map(user =>
                    <div key={"request" + user.id}>
                      <div className="text-sm">
                        {user.username}
                      </div>
                      <div onClick={() => {mutateFriendRequests(user.id)}}>Accept</div>
                      <Separator className="my-2" />
                    </div>
                  )
                }
              </NavigationMenuContent>
            </NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}