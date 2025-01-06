import { deleteComment, editComment } from "@/app/post/comment/actions"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import CommentInterface from "@/interfaces/feed/comment.interface"
import PostInterface from "@/interfaces/feed/post.interface"
import { detectEnterKey, path } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { useState } from "react"
import { mutate } from "swr"

export function Comment(props: { comment: CommentInterface, isOwn?: boolean }) {
  const [ editedComment, setEditedComment ] = useState<string>("")
  const [ commentEditionIsOpen, setCommentEditionIsOpen ] = useState<boolean>(false)

  const id = props.comment.user.id
  const profilePicture = props.comment.user.profilePicture
  const username = props.comment.user.username

  async function deleteCommentAndMutatePostsData() {
    await deleteComment({commentId: props.comment.id}).then(() =>
      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        if (data) {
          data.map(post => post.comments.filter(comment => comment.id !== props.comment.id))
        }
        return data
      })
    )
  }

  async function editCommentAndMutatePostsData() {
    await editComment({commentId: props.comment.id, text: editedComment}).then(() =>
      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        if (data) {
          data.map(post => post.comments.map(comment => {
            if (comment.id === props.comment.id) comment.text = editedComment
          }))
        }
        return data
      })
    )
    setCommentEditionIsOpen(false)
  }

  return (
    !commentEditionIsOpen ?
    <ul role="list" className="divide-y divide-gray-100">
      <li className="flex justify-between gap-x-6 py-5">
        <div className="flex min-w-0 gap-x-4">
          <Avatar>
            <AvatarImage src={`/images/${path.profile}/${profilePicture}.jpeg`} alt={`@${username}`} />
            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold leading-6 text-gray-900"><a href={props.isOwn ? "/user/profile" : `user/profile/${id}`}>{username}</a></p>
            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{props.comment.text}</p>
          </div>
          {
            props.isOwn &&
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <MoreVertical/>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={deleteCommentAndMutatePostsData}>
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCommentEditionIsOpen(true)}>
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        </div>
      </li>
    </ul>
    :
    <Textarea placeholder={props.comment.text} onChange={e => setEditedComment(e.target.value)} onKeyUp={e => detectEnterKey(e) && editCommentAndMutatePostsData() }/>
  )
}