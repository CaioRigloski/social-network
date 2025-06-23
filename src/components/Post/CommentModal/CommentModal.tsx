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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations } from "next-intl"
import { useComment } from "@/hooks/use-comment"


export function CommentModal(props: CommentModalInterface) {
  const t = useTranslations()

  const session = useSession()
  const [ comment, setComment ] = useState<string>("")

  const { create } = useComment(session.data)

  async function commentAndMutatePostsData() {
    create(props.post.id, comment, props.swrKey).then(() => setComment(""))
  }

  return (
    <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <DialogTrigger asChild>
        <div className="grid justify-items-center cursor-pointer gap-1">
          <ChatBubbleIcon width={22} height={22}/>
          <p>{props.post.commentsCount}</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[50vw] w-[50vw] max-h-[95vh] h-[95vh] grid grid-rows-[auto_auto_1fr] break-all bg-foreground text-color border-none">
        <DialogHeader className="flex flex-row gap-2">
          <AvatarComponent user={props.post.user}/>
          <h3>
            <Link href={`/user/profile/${props.post.user.id}`}>{props.post.user?.username}</Link>
          </h3>
        </DialogHeader>
        <DialogTitle className="hidden">
          { t('post.postDetails') }
        </DialogTitle>
        <DialogDescription className="overflow-y-auto standard:text-color">
          { props.post.description }
        </DialogDescription>
        <div className="grid grid-cols-3 grid-rows-1 gap-2">
          <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full max-w-[60rem] max-h-[40rem] object-contain col-span-2"/>
          {
            props.post.comments && props.post.comments.length > 0 ?
            <ScrollArea className="col-span-1 h-[70vh]">
              {
                props.post.comments?.map(comment => <Comment key={comment.id} postId={props.post.id} comment={comment} isOwn={comment.user.id === session.data?.user?.id} swrKey={props.swrKey}/>)
              }
            </ScrollArea>
            :
            <div className="grid items-start text-center text-gray-400">
              <p className="text-color">{ t('post.noCommentsYet') }</p>
            </div>
          }
          <Textarea className="col-span-3 resize-none outline-none focus-visible:ring-1 focus-visible:ring-none border light:border-muted-foreground focus:border-2 standard:text-color-secondary" placeholder={ t('post.leaveAComment') } value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => detectEnterKey(e) && commentAndMutatePostsData()} maxLength={500}/>
        </div>
        <DialogDescription className="hidden">
          { t('post.seePostDetails') }
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}