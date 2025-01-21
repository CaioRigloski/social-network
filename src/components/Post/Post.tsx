import PostInterface from "@/interfaces/feed/post.interface"
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ChatBubbleIcon, HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons"
import { AlertDialog, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Like } from "./Like/Like"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"


export function Post(props: { post: PostInterface }) {
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
      })
    )
  }

  async function likeAndMutatePostsData() {
    await createNewLike({postId: props.post.id}).then((newLike) => 
      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        data?.map(post => {
          if (post.id === props.post.id && newLike) post.likes.unshift(newLike)
        })
        return data
      })
    )
  }

  async function commentAndMutatePostsData() {
    await createNewComment({postId: props.post.id, text: comment}).then((newComment) => 
      mutate<PostInterface[]>("/api/feed/get-posts", data => {
        data?.map(post => {
          if (post.id === props.post.id && newComment) post.comments.unshift(newComment)
        })
      return data
      })
    )
  }

  async function deletePostAndMutatePostsData() {
    await deletePost({postId: props.post.id, imageName: props.post.picture}).then(() => 
        mutate<PostInterface[]>("/api/feed/get-posts", data => data?.filter((post: PostInterface) => post.id !== props.post.id), false)
    )
  }
 
  return (
    <Card className="bg-stone-100">
      <CardHeader className="flex flex-row gap-2">
        <Avatar className="static">
          <AvatarImage src={`/images/${path.profile}/${props.post.user.profilePicture}.${imageFormats.profilePicture}`} alt={`@${props.post.user.username}`} />
          <AvatarFallback className="bg-white">{props.post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle><a href={`/user/profile/${props.post.user.id}`}>{props.post.user?.username}</a></CardTitle>
        {
          props.post.user.id === session.data?.user?.id &&
            <div className="ml-auto">
              <DropdownMenu>
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
      <CardFooter className="p-1 pb-4 flex flex-row gap-2 justify-end w-[30rem] ml-auto mr-auto">
        <div>
          <AlertDialog open={commentModalIsOpen} onOpenChange={() => setCommentModalIsOpen(!commentModalIsOpen)}>
            <AlertDialogTrigger asChild>
              <ChatBubbleIcon width={25} height={25} cursor={"pointer"}/>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[80vw] max-h-[95vh] w-[80vw] h-[95vh]">
              <AlertDialogHeader>
                <AlertDialogTitle>Comments</AlertDialogTitle>
              </AlertDialogHeader>
                <div className="grid grid-cols-3 grid-rows-1 gap-2">
                  <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full object-cover col-span-2"/>
                  {
                    props.post.comments.length > 0 ?
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
                  <Textarea className="col-span-3" placeholder="Leave a comment!" onChange={e => setComment(e.target.value)} onKeyUp={e => detectEnterKey(e) && commentAndMutatePostsData()}/>
                </div>              
            </AlertDialogContent>
          </AlertDialog>
          <p>{props.post.commentsCount}</p>
        </div>
        <div>
          {
            likeId.length > 0 ?
              <HeartFilledIcon width={25} height={25} color="red" cursor={"pointer"} onClick={unlikeAndMutatePostsData}/>
              :
              <HeartIcon width={25} height={25} cursor={"pointer"} onClick={likeAndMutatePostsData}/>
          }
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <p>{props.post.likesCount}</p>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Likes</AlertDialogTitle>
              </AlertDialogHeader>
                {
                  props.post?.likes?.map(like => <Like key={like.id} like={like} isOwn={like.user.id === session.data?.user?.id}/>)
                }
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}