import { deleteComment, editComment } from "@/app/post/comment/actions"
import { Textarea } from "@/components/ui/textarea"
import CommentInterface from "@/interfaces/post/comment/comment.interface"
import PostInterface from "@/interfaces/post/post.interface"
import { detectEnterKey } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { mutate } from "swr"
import { Separator } from "@/components/ui/separator"
import { AvatarComponent } from "@/components/Avatar/Avatar"
import Link from "next/link"
import { API_ROUTES } from "@/lib/apiRoutes"
import CommentComponentInterface from "../../../interfaces/post/CommentComponent/CommentComponent"

export function Comment(props: CommentComponentInterface) {
  const [ editedComment, setEditedComment ] = useState<string>("")
  const [ commentEditionIsOpen, setCommentEditionIsOpen ] = useState<boolean>(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  const id = props.comment.user.id
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
    deleteComment({commentId: props.comment.id}).then(() => {
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        if (data) {
          return data.map(post => {
            if(post.id === props.postId) {
              return {
                ...post,
                comments: post.comments.filter(comment => comment.id !== props.comment.id),
                commentsCount: post.commentsCount - 1
              }
            }
            return post
          })
        }
        return data
      }, false)
    })
  }

  async function editCommentAndMutatePostsData() {
    await editComment({commentId: props.comment.id, text: editedComment}).then(() =>
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        if (data) {
          data.map(post => post.comments.map(comment => {
            if (comment.id === props.comment.id) comment.text = editedComment
          }))
        }
        return data
      }, false)
    )
    setCommentEditionIsOpen(false)
  }

  return (
    !commentEditionIsOpen ?
    <div>

      <div className="flex min-w-0 gap-x-4 p-4">
        <AvatarComponent user={props.comment.user}/>
        <div className="min-w-0 flex-auto">
          <p className="text-sm font-semibold leading-6 text-gray-900">
            <Link href={props.isOwn ? "/user/profile" : `user/profile/${id}`}>{username}</Link>
            </p>
          <p ref={textRef} className={`${isExpanded && "block"} mt-1 text-xs leading-5 text-gray-500 comment-line-limit`}>{props.comment.text}</p>
          {isTruncated && !isExpanded && <button className="mt-1 text-xs leading-5 text-sky-700" onClick={() => setIsExpanded(true)}>See more</button>}
          {isExpanded && <button className="mt-1 text-xs leading-5 text-sky-700" onClick={() => setIsExpanded(false)}>view less</button>}
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
    <Textarea placeholder={props.comment.text} onChange={e => setEditedComment(e.target.value)} onKeyUp={e => detectEnterKey(e) && editCommentAndMutatePostsData()} maxLength={500}/>
  )
}