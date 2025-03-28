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
import { Separator } from "../ui/separator"
import LikeModal from "./LikeModal/LikeModal"
import { CommentModal } from "./CommentModal/CommentModal"


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
            console.log(post)
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
      {
        props.post.picture &&
        <CardContent className="p-1 w-[35rem] h-[35rem] ml-auto mr-auto border">
          <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setCommentModalIsOpen(true)}/>
        </CardContent>
      }
      <Separator/>
      <CardFooter className="p-1 pb-4 flex flex-row gap-2 justify-end w-[32rem] ml-auto mr-auto">
        <CommentModal isOpen={commentModalIsOpen} commentOnChange={e => {setComment(e.target.value)}} commentOnKeyUp={commentAndMutatePostsData} post={props.post}/>
        <LikeModal likeId={likeId} likes={props.post.likes} likesCount={props.post.likesCount} likeOnClick={likeAndMutatePostsData} unlikeOnClick={unlikeAndMutatePostsData}/>
      </CardFooter>
    </Card>
  )
}