
import { Separator } from "@/components/ui/separator"
import LikeInterface from "@/interfaces/feed/like.interface"
import { AvatarComponent } from "@/components/Avatar/Avatar"
import Link from "next/link"

export function Like(props: { like: LikeInterface, isOwn?: boolean }) {
  const id = props.like.user.id
  const username = props.like.user.username

  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <AvatarComponent user={props.like.user}/>
        <p className="text-sm font-semibold leading-6 text-gray-900">
          <Link href={props.isOwn ? "/user/profile" : `user/profile/${id}`}>
            {username}
          </Link>
        </p>
      </div>
      <Separator/>
    </>
  )
}