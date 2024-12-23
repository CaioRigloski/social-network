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
import NotificationCount from "./NotificationsCount/NotificationCount"
import useSWR, { mutate } from "swr"
import { friendsRequestsFetcher } from "@/lib/swr"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { newFriendSchema } from "@/lib/zod"
import { Separator } from "@radix-ui/react-separator"
import { acceptFriendRequest } from "./actions"
import { useSession } from "next-auth/react"
import PostInterface from "@/interfaces/feed/post.interface"
import { Button } from "../ui/button"
import { signOutAction } from "@/app/user/sign-out/actions"
import UserInterface from "@/interfaces/feed/user.interface"
import { usePathname } from "next/navigation"


export default function Header() {
  const session = useSession()
  const pathName = usePathname()

  const friendRequests = useSWR("/api/user/get-friend-requests", friendsRequestsFetcher)

  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

  async function mutateFriendAndPostDatas(newFriendId: string) {

    addNewFriendForm.setValue("newFriendId", newFriendId)
    const res = await acceptFriendRequest(addNewFriendForm.getValues())
    friendRequests.mutate(friendRequests.data?.filter(user => user.id ! == newFriendId))

    if(pathName === "/feed") {
      const newFriendPostsResult = await fetch(`/api/user/get-posts?id=${newFriendId}`)
      const newFriendPosts: PostInterface[] =  await newFriendPostsResult.json()

      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        if (data) return [...data, ...newFriendPosts]
      }, { populateCache: true })
    }

    if(pathName === "/user/friends") {
      mutate<UserInterface[]>("/api/user/get-friends", data => {
        if (data && res.user) return [...data, res.user]
      }, { populateCache: true })
    }
  }

  async function clearCacheAndSignout() {
    await mutate(() => true, undefined, false)
    signOutAction()
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
      <form className="flex justify-end" action={clearCacheAndSignout}>
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
                      <div onClick={() => {mutateFriendAndPostDatas(user.id)}}>Accept</div>
                      <Separator className="my-2" />
                    </div>
                  )
                }
              </NavigationMenuContent>
            </NavigationMenuTrigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/user/chats" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Chat</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}