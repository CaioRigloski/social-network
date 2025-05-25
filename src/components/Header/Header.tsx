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
import { AvatarComponent } from "../Avatar/Avatar"
import { API_ROUTES } from "@/lib/apiRoutes"
import { toast } from "sonner"
import { SearchInputForm } from "../SearchInputForm/SearchInputForm"
import { ThemeToggle } from "../ThemeToggle/ThemeToggle"


export default function Header() {
  const router = useRouter()
  const session = useSession()
  const pathName = usePathname()

  const friendRequests = useSWR(API_ROUTES.user.getFriendRequests, friendsRequestsFetcher)
  
  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

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
      router.push("/user/login")
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  const isFriendRequestsTriggerDisabled = !friendRequests.data || friendRequests.data.length === 0

  return (
    <header className="flex flex-row-reverse place-content-around after:content-[''] after:flex-1 *:flex-1 items-end w-auto min-w-screen sticky top-0 z-50 shadow-md backdrop-blur-sm standard:bg-foreground text-color h-[var(--header-height)] p-[var(--header-padding)] light:hover:bg-white">
      <div className="relative flex gap-x-4 justify-center">
        <div className="text-sm leading-6">
          <div  className="flex items-center gap-x-2">
            {session.data?.user && <AvatarComponent user={session.data.user}/>}
            <Link href="/user/profile">
              <p className="font-semibold text-color">
                  { session.data?.user.username }
              </p>
            </Link>
          </div>
        </div>
        <ThemeToggle />
        <form className="flex justify-end w-fit" action={signOutAndRefresh}>
          <button type="submit" title="Sign out">
            <ExitIcon/>
          </button>
        </form>
      </div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/feed" className={`${navigationMenuTriggerStyle()} text-color bg-foreground`}>Feed</Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/user/friends" className={`${navigationMenuTriggerStyle()} text-color bg-foreground`}>Friends list</Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger disabled={isFriendRequestsTriggerDisabled} className="text-color bg-foreground">
              <p>Friend requests</p>
              <NotificationCount count={friendRequests.data ? friendRequests.data.length : 0}></NotificationCount>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="gap-3 p-3 md:w-[400px] lg:w-[400px] bg-foreground h-max-[500px]">
                {
                  friendRequests?.data?.map(user =>
                    <li key={"request" + user.id} className="grid grid-cols-[80%_auto] grid-rows-[auto_auto] p-0 gap-5 w-full h-[3rem] justify-center items-center align-center rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                      <div className="flex place-items-center gap-2">
                        <AvatarComponent user={user}/>
                        <Link href={`/user/profile/${user.id}`}>
                          <p className="text-color">{ user.username }</p>
                        </Link>
                      </div>
                      <button title="Accept request" onClick={() => mutateFriendAndPostDatas(user.id)} className="flex items-center justify-center bg-white hover:bg-white rounded-full">
                        <CheckIcon className="w-5 h-5 hover:text-green-500"/>
                      </button>
                    </li>
                  )
                }
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <SearchInputForm />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}