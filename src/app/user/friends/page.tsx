'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { friendsFetcher } from "@/lib/swr"
import useSWR from "swr"
import removeFriend from "./actions"
import Link from "next/link"
import { FriendSuggestions } from "@/components/feed/FriendSuggestions/FriendSuggestions"
import { AvatarComponent } from "@/components/Avatar/Avatar"
import { API_ROUTES } from "@/lib/apiRoutes"
import { ProfileCard } from "@/components/ProfileCard/ProfileCard"
import { ChangeEvent, useEffect, useState } from "react"
import UserInterface from "@/interfaces/feed/user.interface"
import { Input } from "@/components/ui/input"

export default function Friends() {
  const friends = useSWR(API_ROUTES.user.getFriends, friendsFetcher)
  const [filteredFriends, setFilteredFriends] = useState<UserInterface[] | undefined>(friends.data)
  const [search, setSearch] = useState<string>("")
 
  useEffect(() => {
    setFilteredFriends(friends.data)
  }, [friends.data])

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    if(e.target.value.length > 0) {
      setFilteredFriends(friends.data?.filter(friend => friend.username.toLowerCase().includes(e.target.value.toLowerCase())))
    } else {
      setFilteredFriends(friends.data)
    }
  }

  if(friends.data?.length === 0) {
    return (
      <div className="grid justify-items-center">
        <Alert>
          <AlertTitle>:(</AlertTitle>
          <AlertDescription>
            You don&apos;t have friends, make some!
          </AlertDescription>
        </Alert>
        <FriendSuggestions/>
      </div>
    )
  }

  if(friends.error) {
    return (
      <Alert>
        <AlertTitle>:(</AlertTitle>
        <AlertDescription>
          Error. Please contact the administrator.
        </AlertDescription>
      </Alert>
    )
  }

  async function removeFriendAndMutateFriendsData(friendId: string) {
    await removeFriend({ friendId: friendId })
    friends.mutate(data => data?.filter(user => user.id !== friendId))
  }

  return (
    <main className="h-[calc(100vh-var(--header-height))]">
      <div className="place-items-left pt-5 px-5">
        <Input type="text" placeholder="Search friends" className="w-64 h-8 outline-none focus-visible:ring-transparent focus:border-2 border-foreground border-[1.5px]" value={search} onChange={handleSearch}/>
      </div>
      <div className="flex flex-row flex-wrap p-5 gap-1">
        {
          filteredFriends?.map(friend => 
            <ProfileCard key={friend.id} user={friend} rightButtonText="Remove" rightButtonAction={() => removeFriendAndMutateFriendsData(friend.id)} style={{position: "static"}}/>
          )
        }
      </div>
    </main>
  )
}