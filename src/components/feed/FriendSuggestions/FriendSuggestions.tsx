import { sendFriendRequest } from "@/app/feed/actions"
import { friendsSuggestionsFetcher } from "@/lib/swr"
import { newFriendSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { API_ROUTES } from "@/lib/apiRoutes"
import { Card } from "@/components/ui/card"


export function FriendSuggestions() {
  const friendsSuggestions = useSWR(API_ROUTES.user.getFriendSuggestions, friendsSuggestionsFetcher)

  const addNewFriendForm = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
  })

  async function addAndMutateFriendsSuggestions(newFriendId: string) {
    addNewFriendForm.setValue("newFriendId", newFriendId)
    sendFriendRequest(addNewFriendForm.getValues()).then(() => {
      friendsSuggestions.mutate(friendsSuggestions.data?.filter(user => user.id !== newFriendId), {
        revalidate: false,
        optimisticData: currentData => currentData?.filter(user => user.id !== newFriendId) || []
      })
    })
  }

  async function ignoreAndMutateFriendsSuggestions(newFriendId: string) {
    friendsSuggestions.mutate(friendsSuggestions.data?.filter(user => user.id !== newFriendId), {
      revalidate: false,
      optimisticData: currentData => currentData?.filter(user => user.id !== newFriendId) || []
    })
  }

  if (friendsSuggestions.data?.length === 0) return null

  const firstUser = friendsSuggestions.data?.[0]

  return (
  <Card className="h-76 w-56 rounded-md border self-start shadow-md bg-foreground text-color" style={{position: "static"}}>
    <div className="p-4 h-full">
      <h4 className="mb-4 text-sm font-medium leading-none">Friend suggestions</h4>
      {
        <div className="flex flex-col w-full items-center align-center">
          <div className="rounded-sm h-5/6 w-5/6">
            <img src={firstUser?.profilePicture ? firstUser.profilePicture : '/avatar.png'} alt={firstUser?.username} className="h-full w-full object-cover mix-blend-multiply"/>
          </div>
          <p className="max-w-full overflow-x-hidden pb-2">{firstUser?.username}</p>
          <div className="grid grid-cols-[1fr_1fr] justify-items-center w-full">
            <Button variant="secondary" className="w-11/12 h-fit px-2 py-1 text-xs" onClick={() => firstUser && addAndMutateFriendsSuggestions(firstUser.id)}>
              Add friend
            </Button>
            <Button variant="secondary" className="w-11/12 h-fit px-2 py-1 text-xs" onClick={() => firstUser &&  ignoreAndMutateFriendsSuggestions(firstUser.id)}>
              Ignore
            </Button>
          </div>
        </div>
      }
    </div>
  </Card>
  )
} 