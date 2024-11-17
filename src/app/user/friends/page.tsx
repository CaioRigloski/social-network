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

  return (
    <Table>
      <TableCaption>A list of your friends!</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Since<br/>mm/dd/yyyy</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          friends.data?.map(friend => (
            <TableRow key={"friend" + friend.id}>
              <TableCell className="font-medium">{friend.id}</TableCell>
              <TableCell>{friend.username}</TableCell>
              <TableCell>{friend.createdAt ? new Date(friend.createdAt).toLocaleDateString("en-US") : "No info"}</TableCell>
              <TableCell className="text-right" onClick={() => removeFriend({friendId: friend.id})}><Button>Remove</Button></TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}