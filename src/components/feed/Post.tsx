import PostInterface from "@/interfaces/feed/post.interface"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import Image from "next/image"

export default function Post(props: PostInterface) {
  const image = Buffer.from(props.picture, 'base64').toString('latin1')

  return (
    <Card key={props.id}>
      <CardHeader>
        <CardTitle>{props.user.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <Image alt="post picture" width={0} height={0} src={atob(image)} className="w-80 h-auto"/>
      </CardContent>
    </Card>
  )
}