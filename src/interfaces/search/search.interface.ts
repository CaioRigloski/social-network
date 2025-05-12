import UserInterface from "../feed/user.interface"
import PostInterface from "../post/post.interface"

export default interface SearchInterface {
  query: string
  posts?: PostInterface[]
  users?: UserInterface[]
}