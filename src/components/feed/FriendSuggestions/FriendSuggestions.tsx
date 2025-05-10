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
import { ProfileCard } from "@/components/ProfileCard/ProfileCard"


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

  if (friendsSuggestions.data?.length === 0 || !friendsSuggestions.data?.[0]) return null
  
  const firstUser = friendsSuggestions.data?.[0]

  return (
    <ProfileCard cardTitle="Friend suggestions" user={firstUser} leftButtonText={"Add friend"} rightButtonText={"Ignore"} leftButtonAction={() => addAndMutateFriendsSuggestions(firstUser.id)} rightButtonAction={() => ignoreAndMutateFriendsSuggestions(firstUser.id)}/>
  )
} 