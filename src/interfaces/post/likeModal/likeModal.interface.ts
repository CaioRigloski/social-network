import LikeInterface from "../like/like.interface"

export default interface LikeModalInterface {
  likeId: string
  likeOnClick: () => void
  unlikeOnClick: () => void
  likes: LikeInterface[]
  likesCount: number
}