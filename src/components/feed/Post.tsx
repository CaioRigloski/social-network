import PostInterface from "@/interfaces/feed/post.interface"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { path } from "@/lib/utils"

export default function Post(props: PostInterface) {
  return (
    <Card key={props?.id}>
      <CardHeader>
        <CardTitle>{props?.user?.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <img alt="post picture" width={0} height={0} src={`/images/${path.posts}/${props.picture}.jpeg`} className="w-80 h-auto"/>
      </CardContent>
    </Card>
  )
}