
import { Badge } from "@/components/ui/badge"
import NotificationCountInterface from "@/interfaces/NotificationCount.interface"

export default function NotificationCount(props: NotificationCountInterface) {
  return (
    <Badge variant={"outline"} className="text-color bg-foreground text-color ml-1">{props.count}</Badge>
  )
}