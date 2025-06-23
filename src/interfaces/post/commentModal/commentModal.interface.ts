import { Dispatch, SetStateAction } from "react"
import PostInterface from "../post.interface"
import { Key } from "swr"

export default interface CommentModalInterface {
  isOpen: boolean
  post: PostInterface,
  setIsOpen: Dispatch<SetStateAction<boolean>>
  swrKey: Key
}