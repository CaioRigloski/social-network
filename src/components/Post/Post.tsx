import PostInterface from "@/interfaces/feed/post.interface"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { path } from "@/lib/utils"
import { Comment } from "@/components/Post/Comment/Comment"
import { Textarea } from "../ui/textarea"
import { KeyboardEvent, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { createNewComment } from "@/app/post/comment/actions"
import { createNewLike, unlike } from "@/app/post/like/actions"
import { useSession } from "next-auth/react"
import { mutate } from "swr"


export function Post(props: PostInterface) {
  const session = useSession()

  const [ likeId, setLikeId ] = useState<string>("")
  const [ comment, setComment ] = useState<string>("")

  // Save the comment just if only the ENTER key is pressed, SHIFT + ENDER breaks the line.
  async function detectEnterKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      await createNewComment({postId: props.id, text: comment})
    }
  }

  async function mutatePostsData(postId: string, likeId: string) {
    await unlike({postId, likeId})

    mutate("/api/feed/get-posts", () => {
      (posts: PostInterface[]) => {
        posts.map(post => {
          if(post.id === postId) {
            post.likes.slice(post.likes.findIndex(like => like.id === likeId))
          }
        })
      }
    })
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props?.user?.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.picture}.jpeg`} className="w-80 h-auto"/>
      </CardContent>
      <CardFooter className="flex flex-col">
        {likeId.length > 0 ? <Button onClick={() => mutatePostsData(props.id, likeId)}>Unlike</Button> : <Button onClick={() => createNewLike({postId: props.id})}>Send like</Button>}
        <p>Like count: {props.likesCount}</p>
        {
          props.likes.map(like => {
            if(like.user.id === session.data?.user?.id) {
              useEffect(() => setLikeId(like.id))
              return <p key={like.id}><strong>{like.user.username}</strong> <strong className="text-sky-500">(you)</strong> liked!</p>
            }
            return <p key={like.id}><strong>{like.user.username}</strong> liked!</p>
          })
        }
        <Textarea placeholder="Leave a comment!" onChange={e => setComment(e.target.value)} onKeyUp={e => detectEnterKey(e)}/>
        {
          props.comments.map(comment => <Comment key={comment.id} id={comment.id} text={comment.text} user={comment.user}/>)
        }
      </CardFooter>
    </Card>
  )
}