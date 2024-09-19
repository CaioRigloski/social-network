import User from "./user.interface"

export default interface Post {
  id: string
  user: User
  picture: string
}