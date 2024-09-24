'use client'

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

export default function Friends() {
  const friends = useSWR("/api/user/get-friends", friendsFetcher)

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
          friends.data && friends.data?.map(friend => (
            <TableRow key={"friend" + friend.id}>
              <TableCell className="font-medium">{friend.id}</TableCell>
              <TableCell>{friend.username}</TableCell>
              <TableCell>{friend.createdAt ? new Date(friend.createdAt).toLocaleDateString("en-US") : "No info"}</TableCell>
              <TableCell className="text-right"><Button>Remove</Button></TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}