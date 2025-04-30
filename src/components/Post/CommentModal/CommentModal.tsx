import { AvatarComponent } from "@/components/Avatar/Avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import CommentModalInterface from "@/interfaces/post/commentModal/commentModal.interface"
import { ChatBubbleIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { Comment } from "../Comment/Comment"
import { detectEnterKey, imageFormats, path } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { createNewComment } from "@/app/post/comment/actions"
import { mutate } from "swr"
import PostInterface from "@/interfaces/post/post.interface"
import { API_ROUTES } from "@/lib/apiRoutes"
import { Separator } from "@/components/ui/separator"

export function CommentModal(props: CommentModalInterface) {
  const session = useSession()
  const [ comment, setComment ] = useState<string>("")

  async function commentAndMutatePostsData() {
    createNewComment({postId: props.post.id, text: comment}).then((newComment) => 
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        return data?.map(post => {
          if (post.id === props.post.id && newComment) {
            return {
              ...post,
              comments: [newComment, ...post.comments],
              commentsCount: post.commentsCount + 1
            }
          }
          return post
        })
      }, false)
    )
  }

  return (
    <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <DialogTrigger asChild>
        <div className="grid justify-items-center cursor-pointer gap-1">
          <ChatBubbleIcon width={25} height={25}/>
          <p>{props.post.commentsCount}</p>
        </div>
      </DialogTrigger>
      <DialogContent className={`max-w-[80vw] max-w-[80vw] max-h-[95vh] ${props.post.picture ? "w-[80vw]" : "w-[40vw]"} h-[95vh] grid grid-rows-[auto_1fr_auto_auto] break-all`}>
        <DialogHeader className="flex flex-row gap-2">
          <AvatarComponent user={props.post.user}/>
          <h3>
            <Link href={`/user/profile/${props.post.user.id}`}>{props.post.user?.username}</Link>
          </h3>
        </DialogHeader>
        <DialogTitle className="hidden">
          Post details.
        </DialogTitle>
        <DialogDescription className="overflow-y-auto whitespace-pre-line">
          { props.post.description }
        </DialogDescription>
        <Separator/>
        <div className={`grid ${props.post.picture ? "grid-cols-3" : "grid-cols-1"} grid-rows-[auto_max-content] gap-2`}>
          { props.post.picture && <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full max-w-[60rem] max-h-[40rem] object-contain col-span-2 border"/> }
          {
            props.post.comments && props.post.comments.length > 0 ?
            <div className="col-span-1 overflow-y-scroll min-h-[25vh] max-h-[25vh]">
              {
                props.post.comments?.map(comment => <Comment key={comment.id} postId={props.post.id} comment={comment} isOwn={comment.user.id === session.data?.user?.id}/>)
              }
            </div>
            :
            <div className="grid items-start text-center text-gray-400">
              <p>No comments yet</p>
            </div>
          }
          <Textarea className="col-span-3 resize-none h-[5rem] self-end" placeholder="Leave a comment!" onChange={e => setComment(e.target.value)} onKeyDown={e => detectEnterKey(e) && commentAndMutatePostsData()} maxLength={500}/>
        </div>
        <DialogDescription className="hidden">
          See the posts details!
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}