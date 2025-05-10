import PostInterface from "@/interfaces/post/post.interface"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { imageFormats, path } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { mutate } from "swr"
import { deletePost } from "@/app/post/actions"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { AvatarComponent } from "../Avatar/Avatar"
import Link from "next/link"
import { API_ROUTES } from "@/lib/apiRoutes"
import { Separator } from "../ui/separator"
import LikeModal from "./LikeModal/LikeModal"
import { CommentModal } from "./CommentModal/CommentModal"
import { useEffect, useRef, useState } from "react"
import { ChatBubbleIcon } from "@radix-ui/react-icons"
import { Comment } from "./Comment/Comment"


export function Post(props: { post: PostInterface, className?: string }) {
  const session = useSession()
  const [ commentModalIsOpen, setCommentModalIsOpen ] = useState<boolean>(false)

  const textRef = useRef<HTMLParagraphElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  function checkIfTruncated() {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current
      setIsTruncated(scrollHeight > clientHeight)
    }
  }

  useEffect(() => {
    checkIfTruncated()
  }, [props.post.description])

  async function deletePostAndMutatePostsData() {
    deletePost({postId: props.post.id, imageName: props.post.picture}).then(() => 
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => data?.filter((post: PostInterface) => post.id !== props.post.id), false)
    )
  }
 
  return (
    <Card className={`${props.className} shadow-md break-all whitespace-pre-wrap text-post-color`}>
      <CardHeader className="flex flex-row rounded-t-md bg-post h-14 items-center">
        <CardTitle className="flex items-center gap-2">
          <AvatarComponent user={props.post.user}/>
          <Link href={ session.data?.user?.id === props.post.user.id ? "/user/profile" : `/user/profile/${props.post.user.id}`}>
            {props.post.user?.username}
          </Link>
        </CardTitle>
        {
          props.post.user.id === session.data?.user?.id &&
            <div className="ml-auto">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button>
                    <MoreVertical className="h-[1rem]"/>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={deletePostAndMutatePostsData}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        }
      </CardHeader>
      {
        props.post.description &&
        <CardDescription ref={textRef} className={`${isExpanded && "block"} p-5 comment-line-limit pb-1`}>
          { props.post.description }
        </CardDescription>
      }
      {isTruncated && !isExpanded && <button className="mt-1 text-xs leading-5 text-sky-700 ml-5" onClick={() => setIsExpanded(true)}>view more</button>}
      {isExpanded && <button className="mt-1 text-xs leading-5 text-sky-700 ml-5" onClick={() => setIsExpanded(false)}>view less</button>}
      {
        props.post.picture &&
        <CardContent className="p-1 w-[35rem] h-[35rem] ml-auto mr-auto border">
          <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setCommentModalIsOpen(true)}/>
        </CardContent>
      }
      <Separator/>
      <CardFooter className="p-0 pb-4 flex flex-col rounded-b-md bg-post text-post-color ">
        <div className="p-1 flex flex-row gap-2 justify-end w-full ml-auto mr-auto text-post-color">
          {
            props.post.picture ?
              <CommentModal isOpen={commentModalIsOpen} setIsOpen={setCommentModalIsOpen} post={props.post}/>
              :
              <div className="grid justify-items-center cursor-pointer gap-1">
                <ChatBubbleIcon width={22} height={22}/>
                <p>{props.post.commentsCount}</p>
              </div>
          }
          <LikeModal postId={props.post.id} likes={props.post.likes} likesCount={props.post.likesCount}/>
        </div>
          {
            !props.post.picture &&
            <div className="w-full p-3">
              <div className="grid grid-cols-1 overflow-y-auto max-h-[10rem] w-full bg-white rounded-sm">
                {
                  props.post.comments.map(comment =>
                    <Comment key={comment.id} postId={props.post.id} comment={comment} isOwn={comment.user.id === session.data?.user?.id} />
                  )
                }
              </div>
            </div>
          }
      </CardFooter>
    </Card>
  )
}