'use client'

import useSWR from "swr"
import { useSession } from "next-auth/react"
import { postsOfUserFetcher } from "@/lib/swr"
import { path } from "@/lib/utils"


export default function Profile() {
  const session = useSession()
  const posts = useSWR(`/api/user/get-posts?id=${session.data?.user?.id}`, postsOfUserFetcher)

  return (
    <main>
      <section>
        <p>{session.data?.user?.username}</p>
      </section>
      <section>
        <div>
          {
            posts.data?.map(post =>
              <img key={post.id} alt="post picture" width={0} height={0} src={`/images/${path.posts}/${post.picture}.jpeg`} className="w-80 h-auto"/>
            )
          }
        </div>
      </section>
    </main>
  )
}