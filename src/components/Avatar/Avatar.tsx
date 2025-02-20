import UserInterface from "@/interfaces/feed/user.interface";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { imageFormats, path } from "@/lib/utils";
import { User } from "next-auth";

export function AvatarComponent(props: { user: UserInterface | User }) {
  return (
    <Avatar className="static">
      <AvatarImage src={`/images/${path.profile}/${props.user.profilePicture}.${imageFormats.profilePicture}`} alt={`@${props.user.username}`} />
      <AvatarFallback>{props.user.username?.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}