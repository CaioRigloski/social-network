
import { Badge } from "@/components/ui/badge"
import NotificationCountInterface from "@/interfaces/NotificationCount.interface"

export default function NotificationCount(props: NotificationCountInterface) {
  return (
    <Badge variant={"outline"}>{props.count}</Badge>
  )
}