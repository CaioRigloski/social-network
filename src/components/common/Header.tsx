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
import useSWR from "swr"
import { friendsRequestsFetcher } from "@/lib/swr"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { newFriendSchema } from "@/lib/zod"
import { Separator } from "@radix-ui/react-separator"
import { acceptFriendRequest } from "@/app/feed/actions"
import { useSession } from "next-auth/react"


export default function Header() {
  const session = useSession()
  const friendRequests = useSWR("/api/user/get-friend-requests", friendsRequestsFetcher)

  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

  async function mutateFriendRequests(newFriendId: string) {
    addNewFriendForm.setValue("newFriendId", newFriendId)
    await acceptFriendRequest(addNewFriendForm.getValues())
    friendRequests.mutate(friendRequests.data)
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
                {session.data?.user?.username}
              </>
            </Link>
          </p>
        </div>
      </div>
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
                      <div onClick={() => {mutateFriendRequests(user.id)}}>ADD</div>
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