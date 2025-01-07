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
import { signOutAction } from "@/app/user/sign-out/actions"
import UserInterface from "@/interfaces/feed/user.interface"
import { usePathname } from "next/navigation"
import { ExitIcon } from "@radix-ui/react-icons"
import { imageFormats, path } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

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
    <header className="flex flex-row-reverse place-content-around after:content-[''] after:flex-1 *:flex-1 items-end bg-cyan-950 p-4">
      <div className="relative flex gap-x-4 justify-center">
        <div className="text-sm leading-6">
          <Link href="/user/profile" className="flex items-center gap-x-2">
            <Avatar>
              <AvatarImage src={`/images/${path.profile}/${session.data?.user?.profilePicture}.${imageFormats.profilePicture}`} alt={`@${session.data?.user?.username}`} />
              <AvatarFallback>{session.data?.user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-gray-900 text-white">
                {session.status === "authenticated" && session.data.user?.username}
            </p>
          </Link>
        </div>
        <form className="flex justify-end w-fit text-white" action={clearCacheAndSignout}>
          <button type="submit" title="Sign out">
            <ExitIcon/>
          </button>
        </form>
      </div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/feed" className={navigationMenuTriggerStyle()}>Feed</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/user/friends" className={navigationMenuTriggerStyle()}>Friends list</NavigationMenuLink>
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