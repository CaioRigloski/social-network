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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { imageFormats, path } from "@/lib/utils"
import Link from "next/link"

export default function Friends() {
  const friends = useSWR("/api/user/get-friends", friendsFetcher)
 
  if(friends.data?.length === 0) {
    return (
      <Alert>
        <AlertTitle>:(</AlertTitle>
        <AlertDescription>
          You don't have friends, make some!
        </AlertDescription>
      </Alert>
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
                <Link href={`/user/profile/${friend.id}`} className="flex place-items-center gap-2 cursor-pointer w-fit">
                  <Avatar>
                    <AvatarImage src={`/images/${path.profile}/${friend.profilePicture}.${imageFormats.profilePicture}`} alt={`@${friend.username}`} />
                    <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p>{friend.username}</p>
                </Link>
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