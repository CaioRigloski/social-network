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
    <Table>
      <TableCaption>A list of your friends!</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Since<br/>mm/dd/yyyy</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          friends.data?.map(friend => (
            <TableRow key={"friend" + friend.id}>
              <TableCell>
                <div className="flex place-items-center gap-2 cursor-pointer w-fit">
                  <AvatarComponent user={friend}/>
                  <Link href={`/user/profile/${friend.id}`}>
                    <p>{friend.username}</p>
                  </Link>
                </div>
                </TableCell>
              <TableCell>{friend.createdAt ? new Date(friend.createdAt).toLocaleDateString("en-US") : "No info"}</TableCell>
              <TableCell className="text-right" onClick={() => removeFriendAndMutateFriendsData(friend.id)}><Button>Remove</Button></TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}