import { HTMLAttributes } from "react";
import UserInterface from "../feed/user.interface";

export default interface profileCardInterface extends HTMLAttributes<HTMLDivElement> {
  user: UserInterface
  cardTitle?: string
  leftButtonText?: string
  rightButtonText?: string
  leftButtonAction?: () => void
  rightButtonAction?: () => void
}