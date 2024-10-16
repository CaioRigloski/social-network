import PostInterface from "@/interfaces/feed/post.interface"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { path } from "@/lib/utils"
import Comment from "@/components/common/Comment"
import { Textarea } from "../ui/textarea"
import { KeyboardEvent, useState } from "react"
import { createNewComment, createNewLike } from "@/app/actions"
import { Button } from "../ui/button"


export default function Post(props: PostInterface) {
  const [ comment, setComment ] = useState<string>("")

  // Save the comment just if only the ENTER key is pressed, SHIFT + ENDER breaks the line.
  async function detectEnterKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      await createNewComment({postId: props.id, text: comment})
    }
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
        <Button onClick={() => createNewLike({postId: props.id})}>Send like</Button>
        <p>Like count: {props.likes.count}</p>
        {
          props.likes.users.map(like => <div>{like.username} liked!</div>)
        }
        <Textarea placeholder="Leave a comment!" onChange={e => setComment(e.target.value)} onKeyUp={e => detectEnterKey(e)}/>
        {
          props.comments.map(comment => <Comment key={comment.id} id={comment.id} text={comment.text} user={comment.user}/>)
        }
      </CardFooter>
    </Card>
  )
}