import { ChangeEvent } from "react"
import PostInterface from "../post.interface"

export default interface CommentModalInterface {
  isOpen: boolean
  post: PostInterface
  commentOnKeyUp: () => void
  commentOnChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}