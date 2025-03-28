import CommentInterface from "@/interfaces/post/comment/comment.interface";

export default interface CommentComponentInterface {
  postId: string
  comment: CommentInterface
  isOwn?: boolean
}