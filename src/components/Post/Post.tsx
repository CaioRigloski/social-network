import PostInterface from "@/interfaces/post/post.interface"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
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
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Like } from "./Like/Like"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { AvatarComponent } from "../Avatar/Avatar"
import Link from "next/link"
import { API_ROUTES } from "@/lib/apiRoutes"


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
    unlike({postId: props.post.id, likeId: likeId}).then(() => 
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        return data?.map(post => {
          if (post.id === props.post.id) {
            return {
              ...post,
              likes: post.likes.filter(like => like.id !== likeId),
              likesCount: post.likesCount - 1
            }
          }
          return post
        })
      }, false)
    )
  }

  async function likeAndMutatePostsData() {
    createNewLike({postId: props.post.id}).then((newLike) => {
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        return data?.map(post => {
          if (post.id === props.post.id && newLike) {
            return {
              ...post,
              likes: [newLike, ...post.likes],
              likesCount: post.likesCount + 1
            }
          }
          return post
        })
      }, false)
    })
  }

  async function commentAndMutatePostsData() {
    createNewComment({postId: props.post.id, text: comment}).then((newComment) => 
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        return data?.map(post => {
          if (post.id === props.post.id && newComment) {
            return {
              ...post,
              comments: [newComment, ...post.comments],
              commentsCount: post.likesCount + 1
            }
          }
          return post
        })
      }, false)
    )
  }

  async function deletePostAndMutatePostsData() {
    deletePost({postId: props.post.id, imageName: props.post.picture}).then(() => 
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => data?.filter((post: PostInterface) => post.id !== props.post.id), false)
    )
  }
 
  return (
    <Card className={`${props.className} shadow-md break-all`}>
      <CardHeader className="flex flex-row p-4">
        <div className="w-full">
          <CardTitle className="flex items-center gap-2 text-zinc-600 dark:text-sky-400/75">
            <AvatarComponent user={props.post.user}/>
            <Link href={ session.data?.user?.id === props.post.user.id ? "/user/profile" : `/user/profile/${props.post.user.id}`}>
              {props.post.user?.username}
            </Link>
          </CardTitle>
        </div>
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
      {
        props.post.description &&
        <CardDescription className="p-5 overflow-y-auto comment-line-limit">
          { props.post.description }
        </CardDescription>
      }
      <CardContent className="p-1 w-[35rem] h-[35rem] ml-auto mr-auto border">
        <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setCommentModalIsOpen(true)}/>
      </CardContent>
      <CardFooter className="p-1 pb-4 flex flex-row gap-2 justify-end w-[32rem] ml-auto mr-auto">
        <div className="flex flex-col items-center gap-1">
          <Dialog open={commentModalIsOpen} onOpenChange={() => setCommentModalIsOpen(!commentModalIsOpen)}>
            <DialogTrigger asChild>
              <ChatBubbleIcon width={25} height={25} cursor={"pointer"}/>
            </DialogTrigger>
            <p className="cursor-default">{props.post.commentsCount}</p>
            <DialogContent className="max-w-[80vw] max-w-[80vw] max-h-[95vh] w-[80vw] h-[95vh] grid grid-rows-[auto_1fr] break-all">
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
              <DialogDescription className="hidden">
                See the posts details!
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col items-center gap-1">
          {
            likeId.length > 0 ?
              <HeartFilledIcon width={25} height={25} color="red" cursor={"pointer"} onClick={unlikeAndMutatePostsData}/>
              :
              <HeartIcon width={25} height={25} cursor={"pointer"} onClick={likeAndMutatePostsData}/>
          }
          <Dialog>
            <DialogTrigger asChild>
              <p className="cursor-pointer">{props.post.likesCount}</p>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Likes</DialogTitle>
              </DialogHeader>
                {
                  props.post.likesCount > 0 ?
                  props.post?.likes?.map(like => <Like key={like.id} like={like} isOwn={like.user.id === session.data?.user?.id}/>)
                  :
                  <p>No likes yet.</p>
                }
                <DialogDescription>
                  See who liked it!
                </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}