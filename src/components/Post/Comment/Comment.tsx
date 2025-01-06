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
import { useEffect, useRef, useState } from "react"
import { mutate } from "swr"
import { Separator } from "@/components/ui/separator"

export function Comment(props: { comment: CommentInterface, isOwn?: boolean }) {
  const [ editedComment, setEditedComment ] = useState<string>("")
  const [ commentEditionIsOpen, setCommentEditionIsOpen ] = useState<boolean>(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  const id = props.comment.user.id
  const profilePicture = props.comment.user.profilePicture
  const username = props.comment.user.username

  function checkIfTruncated() {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current
      setIsTruncated(scrollHeight > clientHeight)
    }
  }

  useEffect(() => {
    checkIfTruncated()
  }, [props.comment.text])

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
    <div>

      <div className="flex min-w-0 gap-x-4 p-4">
        <Avatar>
          <AvatarImage src={`/images/${path.profile}/${profilePicture}.jpeg`} alt={`@${username}`} />
          <AvatarFallback>{username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-auto">
          <p className="text-sm font-semibold leading-6 text-gray-900"><a href={props.isOwn ? "/user/profile" : `user/profile/${id}`}>{username}</a></p>
          <p ref={textRef} className="mt-1 text-xs leading-5 text-gray-500 comment-line-limit">{props.comment.text}</p>
          {isTruncated && <button className="mt-1 text-xs leading-5 text-sky-700">See more</button>}
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
      <Separator/>
    </div>
    :
    <Textarea placeholder={props.comment.text} onChange={e => setEditedComment(e.target.value)} onKeyUp={e => detectEnterKey(e) && editCommentAndMutatePostsData() }/>
  )
}