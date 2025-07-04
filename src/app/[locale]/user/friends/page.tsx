'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { friendsFetcher } from "@/lib/swr"
import useSWR from "swr"
import removeFriend from "./actions"
import { FriendSuggestions } from "@/components/FriendSuggestions/FriendSuggestions"
import { API_ROUTES } from "@/lib/apiRoutes"
import { ProfileCard } from "@/components/ProfileCard/ProfileCard"
import { ChangeEvent, useEffect, useState } from "react"
import UserInterface from "@/interfaces/feed/user.interface"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"


export default function Friends() {
  const t = useTranslations()

  const session = useSession()

  const friends = useSWR(session.data && API_ROUTES.users(session.data?.user.id).friends, friendsFetcher)
  const [filteredFriends, setFilteredFriends] = useState<UserInterface[] | undefined>(friends.data)
  const [search, setSearch] = useState<string>("")
 
  useEffect(() => {
    setFilteredFriends(friends.data)
  }, [friends.data])

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    if(e.target.value.length > 0) {
      setFilteredFriends(friends.data?.filter(friend => friend.username.toLowerCase().includes(e.target.value.toLowerCase())))
    } else {
      setFilteredFriends(friends.data)
    }
  }

  if(friends.data?.length === 0) {
    return (
      <div className="grid justify-items-center">
        <Alert>
          <AlertTitle>:(</AlertTitle>
          <AlertDescription>
            { t('common.dontHaveFriends') }
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
          { t('common.contactAdmin') }
        </AlertDescription>
      </Alert>
    )
  }

  async function removeFriendAndMutateFriendsData(friendId: string) {
    await removeFriend({ friendId: friendId })
    friends.mutate(data => data?.filter(user => user.id !== friendId))
  }

  return (
    <main className="h-[calc(100vh-var(--header-height))]">
      <div className="place-items-left pt-5 px-5">
        <Input type="text" placeholder={ t('common.searchFriends') } className="w-64 h-8 outline-none focus-visible:ring-transparent focus:border-2 border-foreground border-[1.5px]" value={search} onChange={handleSearch}/>
      </div>
      <div className="flex flex-row flex-wrap p-5 gap-1">
        {
          filteredFriends?.map(friend => 
            <ProfileCard key={friend.id} user={friend} rightButtonText={t('common.remove')} rightButtonAction={() => removeFriendAndMutateFriendsData(friend.id)} style={{position: "static"}}/>
          )
        }
      </div>
    </main>
  )
}