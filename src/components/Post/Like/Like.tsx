
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { path } from "@/lib/utils"
import LikeInterface from "@/interfaces/feed/like.interface"

export function Like(props: { like: LikeInterface, isOwn?: boolean }) {
  const id = props.like.user.id
  const profilePicture = props.like.user.profilePicture
  const username = props.like.user.username

  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <Avatar>
          <AvatarImage src={`/images/${path.profile}/${profilePicture}.jpeg`} alt={`@${username}`} />
          <AvatarFallback>{username.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-semibold leading-6 text-gray-900"><a href={props.isOwn ? "/user/profile" : `user/profile/${id}`}>{username}</a></p>
      </div>
      <Separator/>
    </>
  )
}