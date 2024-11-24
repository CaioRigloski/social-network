import { deleteComment } from "@/app/post/comment/actions"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import CommentInterface from "@/interfaces/feed/comment.interface"
import { path } from "@/lib/utils"
import { mutate } from "swr"

export function Comment(props: { comment: CommentInterface, isOwn?: boolean }) {
  const profilePicture = props.comment.user.profilePicture || undefined
  const username = props.comment.user.username

  async function deleteCommentAndMutatePostsData() {
    await deleteComment({commentId: props.comment.id}).then(() =>
      mutate("/api/feed/get-posts", () => {})
    )
  }

  return (
    <ul role="list" className="divide-y divide-gray-100">
      <li className="flex justify-between gap-x-6 py-5">
        <div className="flex min-w-0 gap-x-4">
          <Avatar>
            <AvatarImage src={`/images/${path.profile}/${profilePicture}.jpeg`} alt={`@${username}`} />
            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold leading-6 text-gray-900">{username}</p>
            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{props.comment.text}</p>
          </div>
          {props.isOwn && <Button onClick={deleteCommentAndMutatePostsData}>Delete</Button>}
        </div>
      </li>
    </ul>
  )
}