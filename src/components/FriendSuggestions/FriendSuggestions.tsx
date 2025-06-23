import { sendFriendRequest } from "./actions"
import { friendsSuggestionsFetcher } from "@/lib/swr"
import { newFriendSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import { z } from "zod"
import { API_ROUTES } from "@/lib/apiRoutes"
import { ProfileCard } from "@/components/ProfileCard/ProfileCard"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"


export function FriendSuggestions() {
  const t = useTranslations()

  const session = useSession()

  const friendsSuggestions = useSWR(session.data && API_ROUTES.users(session.data?.user.id).friendSuggestions, friendsSuggestionsFetcher)

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
    <ProfileCard cardTitle="Friend suggestions" user={firstUser} leftButtonText={ t('common.addFriend') } rightButtonText={"Ignore"} leftButtonAction={() => addAndMutateFriendsSuggestions(firstUser.id)} rightButtonAction={() => ignoreAndMutateFriendsSuggestions(firstUser.id)} />
  )
} 