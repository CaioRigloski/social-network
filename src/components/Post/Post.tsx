import PostInterface from "@/interfaces/feed/post.interface"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { detectEnterKey, path } from "@/lib/utils"
import { Comment } from "@/components/Post/Comment/Comment"
import { Textarea } from "../ui/textarea"
import { KeyboardEvent, MouseEventHandler, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { createNewComment } from "@/app/post/comment/actions"
import { createNewLike, unlike } from "@/app/post/like/actions"
import { useSession } from "next-auth/react"
import { mutate } from "swr"
import { deletePost } from "@/app/post/actions"


export function Post(props: { post: PostInterface }) {
  const session = useSession()

  const [ likeId, setLikeId ] = useState<string>("")
  const [ comment, setComment ] = useState<string>("")

  async function unlikeAndMutatePostsData() {
    await unlike({postId: props.post.id, likeId: likeId}).then(() => 
      mutate("/api/feed/get-posts", () => {})
    )
  }

  async function likeAndMutatePostsData() {
    await createNewLike({postId: props.post.id}).then(() => 
      mutate("/api/feed/get-posts", () => {})
    )
  }

  async function commentAndMutatePostsData() {
    await createNewComment({postId: props.post.id, text: comment}).then(() => 
      mutate("/api/feed/get-posts", () => {})
    )
  }

  async function deletePostAndMutatePostsData() {
    await deletePost({postId: props.post.id, imageName: props.post.picture}).then(() => 
        mutate<PostInterface[]>("/api/feed/get-posts", data => data?.filter((post: PostInterface) => post.id !== props.post.id), false)
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.post.user?.username}</CardTitle>
        {props.post.user.id === session.data?.user?.id && <Button onClick={deletePostAndMutatePostsData}>Delete</Button>}
      </CardHeader>
      <CardContent>
        <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.post.picture}.jpeg`} className="w-80 h-auto"/>
      </CardContent>
      <CardFooter className="flex flex-col">
        {likeId.length > 0 ? <Button onClick={unlikeAndMutatePostsData}>Unlike</Button> : <Button onClick={likeAndMutatePostsData}>Send like</Button>}
        <p>Like count: {props.post.likesCount}</p>
        {
          props.post.likes?.map(like => {
            if(like.user.id === session.data?.user?.id) {
              useEffect(() => setLikeId(like.id), [])
              return <p key={like.id}><strong>{like.user.username}</strong> <strong className="text-sky-500">(you)</strong> liked!</p>
            }
            return <p key={like.id}><strong>{like.user.username}</strong> liked!</p>
          })
        }
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