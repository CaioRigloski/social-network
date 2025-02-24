import { sendFriendRequest } from "@/app/feed/actions"
import { friendsSuggestionsFetcher } from "@/lib/swr"
import { newFriendSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { z } from "zod"


export function FriendSuggestions() {
  const friendsSuggestions = useSWR("/api/user/get-friend-suggestions", friendsSuggestionsFetcher)

  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

  async function mutateFriendsSuggestions(newFriendId: string) {
    addNewFriendForm.setValue("newFriendId", newFriendId)
    await sendFriendRequest(addNewFriendForm.getValues())
    friendsSuggestions.mutate(friendsSuggestions.data?.filter(user => user.id !== newFriendId))
  }

  return (
  <ScrollArea className="h-72 w-56 rounded-md border self-start shadow-md" style={{position: "static"}}>
    <div className="p-4">
      <h4 className="mb-4 text-sm font-medium leading-none">Friend suggestions</h4>
      {
        friendsSuggestions.data?.length !== 0 ?
        friendsSuggestions.data?.map((suggestion) => 
          <div key={"suggestion" + suggestion.id}>
            <div className="text-sm">
              {suggestion.username}
            </div>
            <Button type="button" onClick={() => mutateFriendsSuggestions(suggestion.id)}>ADD</Button>
            <Separator className="my-2" />
          </div>
        )
        :
        <p className="justify-self-center">No suggestions</p>
      }
    </div>
  </ScrollArea>
  )
}