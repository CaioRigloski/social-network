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
import { Input } from "../ui/input"
import { FilterIcon, SearchIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Switch } from "../ui/switch"
import { Separator } from "../ui/separator"


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

  const isFriendRequestsTriggerDisabled = !friendRequests.data || friendRequests.data.length === 0

  return (
    <header className="flex flex-row-reverse place-content-around after:content-[''] after:flex-1 *:flex-1 items-end w-auto min-w-screen sticky top-0 z-50 shadow-md backdrop-blur-sm standard:bg-foreground text-color h-[var(--header-height)] p-[var(--header-padding)]">
      <div className="relative flex gap-x-4 justify-center">
        <div className="text-sm leading-6">
          <div  className="flex items-center gap-x-2">
            {session.data?.user && <AvatarComponent user={session.data.user}/>}
            <Link href="/user/profile">
              <p className="font-semibold text-color">
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
            <NavigationMenuLink href="/feed" className={`${navigationMenuTriggerStyle()} text-color bg-foreground`}>Feed</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/user/friends" className={`${navigationMenuTriggerStyle()} text-color bg-foreground`}>Friends list</NavigationMenuLink>
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
                          <p className="text-color">{user.username}</p>
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
            <div className="relative">
              <Input type="text" placeholder="Search" className="w-64 h-8 outline-none border-foreground border-[1.5px] focus:border-2 text-color-secondary" style={{ boxShadow: "revert" }}/>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 h-fit leading-none">
                <Button type="button" className="bg-transparent h-fit w-fit p-0 m-0 hover:bg-transparent">
                  <SearchIcon width={22} height={22} className="text-foreground hover:text-color-secondary" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" className="bg-transparent h-fit w-fit p-0 m-0 hover:bg-transparent">
                      <FilterIcon width={22} height={22} className="text-foreground hover:text-color-secondary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="text-sm w-36 p-3">
                    <ul className="flex flex-col gap-2">
                      <li className="grid grid-cols-2 place-items-center">
                        <p>Posts</p>
                        <Switch size={"sm"} className="data-[state=checked]:!bg-foreground"/>
                      </li>
                      <Separator />
                      <li className="grid grid-cols-2 place-items-center">
                        <p>Users</p>
                        <Switch size={"sm"} className="data-[state=checked]:!bg-foreground"/>
                      </li>
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}