import UserInterface from "@/interfaces/feed/user.interface"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { imageFormats, path } from "@/lib/utils"
import { User } from "next-auth"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { forwardRef } from "react"

export const AvatarComponent = forwardRef<HTMLDivElement, { user: UserInterface | User }>(
  (props, ref) => {
    const session = useSession()

    return (
      <Link href={props.user.id === session.data?.user?.id ? "/user/profile" : `/user/profile/${props.user.id}`} title={props.user.username}>
        <Avatar ref={ref} className="static">
          <AvatarImage 
            src={`/images/${path.profile}/${props.user.profilePicture}.${imageFormats.profilePicture}`} 
            alt={`@${props.user.username}`} 
          />
          <AvatarFallback>
            {props.user.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    )
  }
)

AvatarComponent.displayName = 'AvatarComponent'