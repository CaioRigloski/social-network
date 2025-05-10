import UserInterface from "../feed/user.interface";

export default interface profileCardInterface {
  user: UserInterface
  leftButtonText: string
  rightButtonText: string
  leftButtonAction: () => void
  rightButtonAction: () => void
}