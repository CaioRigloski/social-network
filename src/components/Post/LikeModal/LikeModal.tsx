import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import LikeModalInterface from "@/interfaces/post/likeModal/likeModal.interface"
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons"
import { Like } from "../Like/Like"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { unlike } from "@/app/post/like/actions"
import { mutate } from "swr"
import PostInterface from "@/interfaces/post/post.interface"
import { API_ROUTES } from "@/lib/apiRoutes"
import { useLikeMutation } from "@/hooks/post"

export default function LikeModal(props: LikeModalInterface) {
  const session = useSession()
  const [ likeId, setLikeId ] = useState<string>("")

  async function unlikeAndMutatePostsData() {
    unlike({postId: props.postId, likeId: likeId}).then(() => 
      mutate<PostInterface[]>(API_ROUTES.feed.getPosts, data => {
        return data?.map(post => {
          if (post.id === props.postId) {
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
          <HeartFilledIcon width={25} height={25} color="red" cursor={"pointer"} onClick={unlikeAndMutatePostsData}/>
          :
          <HeartIcon width={25} height={25} cursor={"pointer"} onClick={() => props.swrKey && useLikeMutation(props.postId, props.swrKey)}/>
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