import LikeInterface from "../like/like.interface"

export default interface LikeModalInterface {
  postId: string
  likes: LikeInterface[]
  likesCount: number
}