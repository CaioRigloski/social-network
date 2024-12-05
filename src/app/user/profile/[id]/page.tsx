'use client'

import useSWR from "swr"
import { postsOfUserFetcher, userFetcher } from "@/lib/swr"
import { path} from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ThirdUserProfileParamsInterface } from "@/interfaces/params/user/third-profile.interface"
import { useParams } from "next/navigation"


export default function Profile() {
  const params: ThirdUserProfileParamsInterface = useParams()
  const user = useSWR(`/api/user/get-user-info?id=${params.id}`, userFetcher)
  const posts = useSWR(`/api/user/get-posts?id=${params.id}`, postsOfUserFetcher)

  const profilePicture = user.data?.profilePicture || null
  const username = user.data?.username

  return (
    <main>
      <section>
        <Dialog>
          <DialogTrigger asChild>
            <Avatar>
              <AvatarImage src={`/images/${path.profile}/${profilePicture}.jpeg`} alt={`@${username}`} />
              <AvatarFallback>{username?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile picture</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <p>{username}</p>
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