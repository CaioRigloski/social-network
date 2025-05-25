import { deleteComment, editComment } from "@/components/Post/Comment/actions"
import { Textarea } from "@/components/ui/textarea"
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
import CommentComponentInterface from "../../../interfaces/post/commentComponent/commentComponent.interface"

export function Comment(props: CommentComponentInterface) {
  const [ editedComment, setEditedComment ] = useState<string>(props.comment.text)
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
          <p className="text-sm font-semibold leading-6 text-color">
            <Link href={props.isOwn ? "/user/profile" : `user/profile/${id}`}>{username}</Link>
            </p>
          <p ref={textRef} className={`${isExpanded && "block"} mt-1 text-xs leading-5 comment-line-limit text-color`}>{props.comment.text}</p>
          {isTruncated && !isExpanded && <button className="mt-1 text-xs leading-5 text-sky-700 standard:text-color font-medium" onClick={() => setIsExpanded(true)}>view more</button>}
          {isExpanded && <button className="mt-1 text-xs leading-5 text-sky-700 standard:text-color font-medium" onClick={() => setIsExpanded(false)}>view less</button>}
        </div>
        {
          props.isOwn &&
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <MoreVertical className="h-[0.8rem]"/>
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
    <Textarea value={editedComment} onChange={e => setEditedComment(e.target.value)} onKeyDown={e => detectEnterKey(e) && editCommentAndMutatePostsData()} maxLength={500} className="outline-none focus-visible:ring-1 focus-visible:ring-none border-none focus:border-none text-color-secondary" />
  )
}