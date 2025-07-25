'use client'

import { Post } from "@/components/Post/Post"
import { ProfileCard } from "@/components/ProfileCard/ProfileCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { API_ROUTES } from "@/lib/apiRoutes"
import { searchFetcher } from "@/lib/swr"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { useTranslations } from "next-intl"


export default function Search() {
  const t = useTranslations()

  const searchParams = useSearchParams()

  const query = searchParams.get("query") || ""
  const posts = searchParams.get("posts") ? searchParams.get("posts") === "true" : true
  const users = searchParams.get("users") ? searchParams.get("users") === "true" : true

  const swrKey = API_ROUTES.search(posts, users, query)

  const results = useSWR(swrKey, searchFetcher)
  
  const noResults = results.data && (!results.data.users?.length && !results.data.posts?.length)

  if(noResults) {
    return (
      <main className="place-items-center h-[calc(100vh-var(--header-height))] grid items-center">
        <Alert className="bg-foreground text-color w-[var(--post-width)]">
          <AlertTitle>:&#40;</AlertTitle>
          <AlertDescription>
            { t('common.noSearchResults') }
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="place-items-center h-[calc(100vh-var(--header-height))]">
      <div className="flex flex-row p-5 max-w-screen overflow-x-auto gap-3">
        { results.data?.users?.map(user => <ProfileCard key={user.id} user={user} leftButtonText={ t('common.addFriend') } leftButtonAction={() => {}} />) }
      </div>
      <div className="grid gap-10">
        { results.data?.posts?.map(post => <Post key={post.id} swrKey={swrKey} post={post} />)}
      </div>
      {
        results.data?.posts && results.data?.posts?.length > 0|| results.data?.users && results.data?.users?.length > 0 && <p className="p-5 text-gray-300">{ t('common.noMoreResults') }</p>
      } 
    </main>
  )
}