import { friendsFetcher } from "@/lib/swr"
import { ScrollArea } from "../ui/scroll-area"
import useSWR from "swr"
import { AvatarComponent } from "../Avatar/Avatar"

export function FriendsAvatars() {
  const friends = useSWR("/api/user/get-friends", friendsFetcher)

  return (
    <ScrollArea className="h-72 w-56 max-w-56 max-h-72 border shadow-md self-start mt-[4rem] rounded-md">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">My friends</h4>
        <div className="flex gap-2 flex-wrap">
          {
            friends.data?.map(friend =>
              <AvatarComponent user={friend}/>
            )
          }
        </div>
    </div>
    </ScrollArea>
  )
}