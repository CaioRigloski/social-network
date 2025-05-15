import UserInterface from "@/interfaces/feed/user.interface"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { imageFormats, path } from "@/lib/utils"
import { User } from "next-auth"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { forwardRef } from "react"

export const AvatarComponent = forwardRef<HTMLSpanElement, { user: UserInterface | User, disabled?: boolean, className?: string }>(
  (props, ref) => {
    const session = useSession()

    const avatarContent = (
      <Avatar ref={ref} className={`static hover:opacity-75 duration-300 ${props.className}`}>
        <AvatarImage 
          src={`/images/${path.profile}/${props.user.profilePicture}.${imageFormats.profilePicture}`} 
          alt={`@${props.user.username}`} 
        />
        <AvatarFallback className="text-primary text-sm bg-secondary standard:group-hover/avatar:border standard:group-hover/avatar:border-black">
          {props.user.username?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )

    return props.disabled ? (
      <div>{avatarContent}</div>
    ) : (
      <Link href={props.user.id === session.data?.user?.id ? "/user/profile" : `/user/profile/${props.user.id}`} title={props.user.username}>
        {avatarContent}
      </Link>
    )
  }
)