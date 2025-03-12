import PostInterface from "@/interfaces/post/post.interface"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { detectEnterKey, imageFormats, path } from "@/lib/utils"
import { Comment } from "@/components/Post/Comment/Comment"
import { Textarea } from "../ui/textarea"
import { useEffect, useState } from "react"
import { createNewComment } from "@/app/post/comment/actions"
import { createNewLike, unlike } from "@/app/post/like/actions"
import { useSession } from "next-auth/react"
import { mutate } from "swr"
import { deletePost } from "@/app/post/actions"
import { ChatBubbleIcon, HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons"
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { Like } from "./Like/Like"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { AvatarComponent } from "../Avatar/Avatar"
import Link from "next/link"


export function Post(props: { post: PostInterface, className?: string }) {
  const session = useSession()

  const [ likeId, setLikeId ] = useState<string>("")
  const [ comment, setComment ] = useState<string>("")
  const [ commentModalIsOpen, setCommentModalIsOpen ] = useState<boolean>(false)

  useEffect(() => {
    const userLikeId = props.post?.likes?.find(like => like.user.id === session.data?.user?.id)
    if(userLikeId) {
      setLikeId(userLikeId.id)
    } else {
      setLikeId("")
    }
  }, [props.post.likes])

  async function unlikeAndMutatePostsData() {
    await unlike({postId: props.post.id, likeId: likeId}).then(() => 
      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        data?.map(post => post.likes.filter(like => like.id !== likeId))
        return data
      }, false)
    )
  }

  async function likeAndMutatePostsData() {
    await createNewLike({postId: props.post.id}).then((newLike) => 
      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        data?.map(post => {
          if (post.id === props.post.id && newLike) post.likes.unshift(newLike)
        })
        return data
      }, false)
    )
  }

  async function commentAndMutatePostsData() {
    await createNewComment({postId: props.post.id, text: comment}).then((newComment) => 
      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        data?.map(post => {
          if (post.id === props.post.id && newComment) post.comments.unshift(newComment)
        })
      return data
      }, false),
    )
  }

  async function deletePostAndMutatePostsData() {
    await deletePost({postId: props.post.id, imageName: props.post.picture}).then(() => 
        mutate<PostInterface[]>("/api/feed/get-posts", data => data?.filter((post: PostInterface) => post.id !== props.post.id), false)
    )
  }
 
  return (
    <Card className={`${props.className} shadow-md`}>
      <CardHeader className="flex flex-row gap-2 p-4">
        <AvatarComponent user={props.post.user}/>
        <CardTitle className="text-zinc-600 dark:text-sky-400/75">
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
                    <MoreVertical/>
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
      <CardContent className="p-1 w-[35rem] h-[35rem] ml-auto mr-auto">
        <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setCommentModalIsOpen(true)}/>
      </CardContent>
      <CardFooter className="p-1 pb-4 flex flex-row gap-2 justify-end w-[32rem] ml-auto mr-auto">
        <div className="flex flex-col items-center gap-1">
          <AlertDialog open={commentModalIsOpen} onOpenChange={() => setCommentModalIsOpen(!commentModalIsOpen)}>
            <AlertDialogTrigger asChild>
              <ChatBubbleIcon width={25} height={25} cursor={"pointer"}/>
            </AlertDialogTrigger>
            <p className="cursor-default">{props.post.commentsCount}</p>

            <AlertDialogContent className="max-w-[80vw] max-h-[95vh] w-[80vw] h-[95vh] grid grid-rows-[auto_1fr]">
              <AlertDialogHeader className="flex flex-row gap-2">
                <AvatarComponent user={props.post.user}/>
                <h3>
                  <Link href={`/user/profile/${props.post.user.id}`}>{props.post.user?.username}</Link>
                </h3>
              </AlertDialogHeader>
              <AlertDialogTitle className="hidden">
                Post details.
              </AlertDialogTitle>
              <div className="grid grid-cols-3 grid-rows-1 gap-2">
                <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full max-w-[60rem] max-h-[40rem] object-contain col-span-2"/>
                {
                  props.post.comments && props.post.comments.length > 0 ?
                  <div className="col-span-1 overflow-y-scroll max-h-[70vh]">
                    {
                      props.post.comments?.map(comment => <Comment key={comment.id} comment={comment} isOwn={comment.user.id === session.data?.user?.id}/>)
                    }
                  </div>
                  :
                  <div className="grid items-start text-center text-gray-400">
                    <p>No comments yet</p>
                  </div>
                }
                <Textarea className="col-span-3 resize-none" placeholder="Leave a comment!" onChange={e => setComment(e.target.value)} onKeyUp={e => detectEnterKey(e) && commentAndMutatePostsData()}/>
              </div>
              <AlertDialogDescription className="hidden">
                See the posts details!
              </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex flex-col items-center gap-1">
          {
            likeId.length > 0 ?
              <HeartFilledIcon width={25} height={25} color="red" cursor={"pointer"} onClick={unlikeAndMutatePostsData}/>
              :
              <HeartIcon width={25} height={25} cursor={"pointer"} onClick={likeAndMutatePostsData}/>
          }
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <p className="cursor-pointer">{props.post.likesCount}</p>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Likes</AlertDialogTitle>
              </AlertDialogHeader>
                {
                  props.post.likesCount > 0 ?
                  props.post?.likes?.map(like => <Like key={like.id} like={like} isOwn={like.user.id === session.data?.user?.id}/>)
                  :
                  <p>No likes yet.</p>
                }
                <AlertDialogDescription>
                  See who liked it!
                </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}