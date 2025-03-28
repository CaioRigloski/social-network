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

export function CommentModal(props: CommentModalInterface) {
  const session = useSession()
  const [ commentModalIsOpen, setCommentModalIsOpen ] = useState<boolean>(false)

  return (
    <Dialog open={commentModalIsOpen} onOpenChange={() => setCommentModalIsOpen(!commentModalIsOpen)}>
      <DialogTrigger asChild>
        <div className="grid justify-items-center cursor-pointer gap-1">
          <ChatBubbleIcon width={25} height={25}/>
          <p>{props.post.commentsCount}</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] max-w-[80vw] max-h-[95vh] w-[80vw] h-[95vh] grid grid-rows-[auto_auto_1fr] break-all">
        <DialogHeader className="flex flex-row gap-2">
          <AvatarComponent user={props.post.user}/>
          <h3>
            <Link href={`/user/profile/${props.post.user.id}`}>{props.post.user?.username}</Link>
          </h3>
        </DialogHeader>
        <DialogTitle className="hidden">
          Post details.
        </DialogTitle>
        <DialogDescription className="overflow-y-auto">
          { props.post.description }
        </DialogDescription>
        <div className="grid grid-cols-3 grid-rows-1 gap-2">
          <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full max-w-[60rem] max-h-[40rem] object-contain col-span-2 border"/>
          {
            props.post.comments && props.post.comments.length > 0 ?
            <div className="col-span-1 overflow-y-scroll max-h-[70vh]">
              {
                props.post.comments?.map(comment => <Comment key={comment.id} postId={props.post.id} comment={comment} isOwn={comment.user.id === session.data?.user?.id}/>)
              }
            </div>
            :
            <div className="grid items-start text-center text-gray-400">
              <p>No comments yet</p>
            </div>
          }
          <Textarea className="col-span-3 resize-none" placeholder="Leave a comment!" onChange={e => props.commentOnChange(e)} onKeyUp={e => detectEnterKey(e) && props.commentOnKeyUp()} maxLength={500}/>
        </div>
        <DialogDescription className="hidden">
          See the posts details!
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}