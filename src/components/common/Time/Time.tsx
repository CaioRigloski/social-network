import TimeComponentInterface from "@/interfaces/common/timeComponent.interface"
import { formatDate } from "@/lib/utils"

export function Time({ date, className, ...props }: TimeComponentInterface) {
  return (
    <time className={className} dateTime={date.toString()}>
      { formatDate(date) } 
    </time>
  )
}