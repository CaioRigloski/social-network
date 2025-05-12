import UserInterface from "../../feed/user.interface"
import PostInterface from "../../post/post.interface"

export default interface SearchResultInterface {
  posts?: PostInterface[]
  users?: UserInterface[]
}