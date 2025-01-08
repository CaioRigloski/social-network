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
import { acceptFriendRequest } from "./actions"
import { useSession } from "next-auth/react"
import PostInterface from "@/interfaces/feed/post.interface"
import { signOutAction } from "@/app/user/sign-out/actions"
import UserInterface from "@/interfaces/feed/user.interface"
import { usePathname } from "next/navigation"
import { CheckIcon, ExitIcon } from "@radix-ui/react-icons"
import { imageFormats, path } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Separator } from "../ui/separator"

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
    <header className="flex flex-row-reverse place-content-around after:content-[''] after:flex-1 *:flex-1 items-end bg-cyan-950 p-4 fixed w-screen">
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
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="gap-3 p-3 md:w-[400px] lg:w-[500px]">
                {
                  friendRequests?.data?.map(user =>
                    <li key={"request" + user.id} className="grid grid-cols-[80%_auto] grid-rows-[auto_auto] gap-5 w-full h-full justify-center items-center p-3 pb-0 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                      <Link href={`/user/profile/${user.id}`} className="flex place-items-center gap-2">
                        <Avatar>
                          <AvatarImage src={`/images/${path.profile}/${user.profilePicture}.${imageFormats.profilePicture}`} alt={`@${user.username}`} />
                          <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p>{user.username}</p>
                      </Link>
                      <button title="Accept request" onClick={() => mutateFriendAndPostDatas(user.id)} className="flex items-center justify-center bg-white hover:bg-white rounded-full">
                        <CheckIcon className="w-5 h-5 hover:text-green-500"/>
                      </button>
                      <Separator className="col-span-2"/>
                    </li>
                  )
                }
              </ul>
            </NavigationMenuContent>
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