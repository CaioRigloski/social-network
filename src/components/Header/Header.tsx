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
import PostInterface from "@/interfaces/post/post.interface"
import { signOutAction } from "@/app/user/sign-out/actions"
import UserInterface from "@/interfaces/feed/user.interface"
import { usePathname, useRouter } from "next/navigation"
import { CheckIcon, ExitIcon } from "@radix-ui/react-icons"
import { Separator } from "../ui/separator"
import { AvatarComponent } from "../Avatar/Avatar"
import { API_ROUTES } from "@/lib/apiRoutes"
import { toast } from "sonner"


export default function Header() {
  const router = useRouter()
  const session = useSession()
  const pathName = usePathname()

  const friendRequests = useSWR(API_ROUTES.user.getFriendRequests, friendsRequestsFetcher)
  
  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

  if (session.status === "unauthenticated") return null

  async function mutateFriendAndPostDatas(newFriendId: string) {
    addNewFriendForm.setValue("newFriendId", newFriendId)
    const res = await acceptFriendRequest(addNewFriendForm.getValues())
    friendRequests.mutate(friendRequests.data?.filter(user => user.id ! == newFriendId))

    if(pathName === "/feed") {
      const newFriendPostsResult = await fetch(`${API_ROUTES.user.getPosts}?id=${newFriendId}`)
      const newFriendPosts: PostInterface[] =  await newFriendPostsResult.json()

      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        if (data) return [...data, ...newFriendPosts]
      }, { populateCache: true })
    }

    if(pathName === "/user/friends") {
      mutate<UserInterface[]>(API_ROUTES.user.getFriends, data => {
        if (data && res.user) return [...data, res.user]
      }, { populateCache: true })
    }
  }

  async function signOutAndRefresh() {
    const res = await signOutAction()

    if(res.success) {
      router.refresh()
    } else {
      toast(res.message)
    }
  }

  return (
    <header className="flex flex-row-reverse place-content-around after:content-[''] after:flex-1 *:flex-1 items-end p-4 w-auto min-w-screen sticky top-0 z-50 shadow-md hover:bg-white backdrop-blur-sm">
      <div className="relative flex gap-x-4 justify-center">
        <div className="text-sm leading-6">
          <div  className="flex items-center gap-x-2">
            {session.data?.user && <AvatarComponent user={session.data.user}/>}
            <Link href="/user/profile">
              <p className="font-semibold text-gray-900">
                  {session.status === "authenticated" && session.data.user?.username}
              </p>
            </Link>
          </div>
        </div>
        <form className="flex justify-end w-fit" action={signOutAndRefresh}>
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
            <NavigationMenuTrigger disabled={friendRequests.data?.length === 0}>
              <p>Friend requests</p>
              <NotificationCount count={friendRequests.data ? friendRequests.data.length : 0}></NotificationCount>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="gap-3 p-3 md:w-[400px] lg:w-[500px]">
                {
                  friendRequests?.data?.map(user =>
                    <li key={"request" + user.id} className="grid grid-cols-[80%_auto] grid-rows-[auto_auto] gap-5 w-full h-full justify-center items-center p-3 pb-0 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                      <div className="flex place-items-center gap-2">
                        <AvatarComponent user={user}/>
                        <Link href={`/user/profile/${user.id}`}>
                          <p>{user.username}</p>
                        </Link>
                      </div>
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
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}