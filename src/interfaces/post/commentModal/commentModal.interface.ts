import { ChangeEvent } from "react"
import PostInterface from "../post.interface"

export default interface CommentModalInterface {
  isOpen: boolean
  post: PostInterface
}