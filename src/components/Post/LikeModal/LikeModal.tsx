import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import LikeModalInterface from "@/interfaces/post/likeModal/likeModal.interface"
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons"
import { Like } from "../Like/Like"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useLikeMutation, useUnlikeMutation } from "@/hooks/post"

export default function LikeModal(props: LikeModalInterface) {
  const session = useSession()
  const [ likeId, setLikeId ] = useState<string>("")

  useEffect(() => {
    const userLikeId = props.likes?.find(like => like.user.id === session.data?.user?.id)
    if(userLikeId) {
      setLikeId(userLikeId.id)
    } else {
      setLikeId("")
    }
  }, [props.likes])

  return (
    <div className="flex flex-col items-center gap-1">
      {
        likeId.length > 0 ?
          <HeartFilledIcon width={25} height={25} color="red" cursor={"pointer"} onClick={() => useUnlikeMutation(props.postId, likeId, props.swrKey)}/>
          :
          <HeartIcon width={25} height={25} cursor={"pointer"} onClick={() => useLikeMutation(props.postId, props.swrKey)}/>
      }
      <Dialog>
        <DialogTrigger asChild>
          <p className="cursor-pointer">{props.likesCount}</p>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Likes</DialogTitle>
          </DialogHeader>
            {
              props.likesCount > 0 ?
              props.likes?.map(like => <Like key={like.id} like={like} isOwn={like.user.id === session.data?.user?.id}/>)
              :
              <p>No likes yet.</p>
            }
            <DialogDescription>
              See who liked it!
            </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}