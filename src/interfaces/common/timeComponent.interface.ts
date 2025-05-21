import { ComponentProps } from "react";

export default interface TimeComponentInterface extends ComponentProps<"time"> {
  date: Date
}