import CommentInterface from "@/interfaces/post/comment/comment.interface";
import { Key } from "swr";

export default interface CommentComponentInterface {
  postId: string
  comment: CommentInterface
  isOwn?: boolean
  swrKey: Key
}