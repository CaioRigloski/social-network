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

export default function Friends() {
  const friends = useSWR(API_ROUTES.user.getFriends, friendsFetcher)
 
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
    <main className="h-[calc(100vh-var(--header-height)-var(--header-padding))]">
      <div className="grid grid-cols-8 grid-rows-auto p-5">
        {
          friends.data?.map(friend => 
            <ProfileCard key={friend.id} user={friend} rightButtonText="Remove" rightButtonAction={() => removeFriendAndMutateFriendsData(friend.id)} style={{position: "static"}}/>
          )
        }
      </div>
    </main>
  )
}