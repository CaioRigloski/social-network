'use client'

import { Post } from "@/components/Post/Post"
import { ProfileCard } from "@/components/ProfileCard/ProfileCard"
import { API_ROUTES } from "@/lib/apiRoutes"
import { searchFetcher } from "@/lib/swr"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"

export default function Search() {
  const searchParams = useSearchParams()

  const query = searchParams.get("query") || ""
  const posts = searchParams.get("posts") ? searchParams.get("posts") === "true" : true
  const users = searchParams.get("users") ? searchParams.get("users") === "true" : true

  const results = useSWR(API_ROUTES.search.getSearch, () => searchFetcher(API_ROUTES.search.getSearch, query, posts, users))
  
  return (
    <div>
      <div>
        { results.data?.users?.map(user => <ProfileCard key={user.id} user={user} leftButtonText="Add friend" leftButtonAction={() => {}}/>) }
      </div>
      <div>
        { results.data?.posts?.map(post => <Post key={post.id} post={post} />)}
      </div>
    </div>
  )
}