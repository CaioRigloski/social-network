import NotificationCountInterface from "@/interfaces/NotificationCount.interface";
import { Badge } from "@/components/ui/badge"

export default function NotificationCount(props: NotificationCountInterface) {
  return (
    <Badge variant={"outline"}>{props.count}</Badge>
  )
}