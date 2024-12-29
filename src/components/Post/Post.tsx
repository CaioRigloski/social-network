import PostInterface from "@/interfaces/feed/post.interface"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { detectEnterKey, imageFormats, path } from "@/lib/utils"
import { Comment } from "@/components/Post/Comment/Comment"
import { Textarea } from "../ui/textarea"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { createNewComment } from "@/app/post/comment/actions"
import { createNewLike, unlike } from "@/app/post/like/actions"
import { useSession } from "next-auth/react"
import { mutate } from "swr"
import { deletePost } from "@/app/post/actions"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ChatBubbleIcon, HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons"


export function Post(props: { post: PostInterface }) {
  const session = useSession()

  const [ likeId, setLikeId ] = useState<string>("")
  const [ comment, setComment ] = useState<string>("")

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
    <Card className="bg-stone-100 w-2/4">
      <CardHeader className="flex flex-row gap-2">
        <Avatar>
          <AvatarImage src={`/images/${path.profile}/${props.post.user.profilePicture}.${imageFormats.profilePicture}`} alt={`@${props.post.user.username}`} />
          <AvatarFallback>{props.post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle><a href={`/user/profile/${props.post.user.id}`}>{props.post.user?.username}</a></CardTitle>
        {props.post.user.id === session.data?.user?.id && <Button onClick={deletePostAndMutatePostsData}>Delete</Button>}
      </CardHeader>
      <CardContent className="w-[30rem] h-[30rem] overflow-hidden ml-auto mr-auto ">
        <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.${imageFormats.posts}`} className="w-full h-full object-scale-down"/>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div>
          <ChatBubbleIcon width={25} height={25} cursor={"pointer"}/>
          <p>{props.post.commentsCount}</p>
        </div>
        <div>
          {
            likeId.length > 0 ?
              <HeartFilledIcon width={25} height={25} color="red" cursor={"pointer"} onClick={unlikeAndMutatePostsData}/>
              :
              <HeartIcon width={25} height={25} cursor={"pointer"} onClick={likeAndMutatePostsData}/>
          }
          <p>{props.post.likesCount}</p>
        </div>
        <Textarea placeholder="Leave a comment!" onChange={e => setComment(e.target.value)} onKeyUp={e => detectEnterKey(e) && commentAndMutatePostsData()}/>
        {
          props.post.comments?.map(comment => {
            if(comment.user.id === session.data?.user?.id) {
              return <Comment key={comment.id} comment={comment} isOwn/>
            }
            return <Comment key={comment.id} comment={comment}/>
          })
        }
      </CardFooter>
    </Card>
  )
}