import UserInterface from "@/interfaces/feed/user.interface"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { imageFormats, path } from "@/lib/utils"
import { User } from "next-auth"
import Link from "next/link"
import { useSession } from "next-auth/react"
import React from "react"

function AvatarComponentFn(props: { user: UserInterface | User, disabled?: boolean, className?: string }, ref: React.Ref<HTMLSpanElement>){
    const session = useSession()

    const avatarContent = (
      <Avatar ref={ref} className={`static hover:opacity-75 duration-300 ${props.className}`}>
        <AvatarImage 
          src={`/images/${path.profile}/${props.user.profilePicture}.${imageFormats.profilePicture}`} 
          alt={`@${props.user.username}`}
          className="object-cover"
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

  export const AvatarComponent = React.forwardRef(AvatarComponentFn)