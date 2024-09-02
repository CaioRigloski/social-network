import User from "./user.interface"

export default interface Post {
  id: number
  user: User
  picture: string
}