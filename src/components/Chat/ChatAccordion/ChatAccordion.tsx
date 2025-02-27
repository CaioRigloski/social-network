import { friendsFetcher } from "@/lib/swr"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import useSWR from "swr"
import { AvatarComponent } from "@/components/Avatar/Avatar"
import { ChatList } from "../ChatList/ChatList"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ChatAccordion() {
  const friends = useSWR("/api/user/get-friends", friendsFetcher)

  return (
    <Accordion type="single" collapsible className="w-[20rem]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Lets talk to someone?</AccordionTrigger>
        <AccordionContent className="">
          <ScrollArea className="h-[20rem]">
            {
              friends.data?.map(friend => (
                  <div key={friend.id} className="flex items-center p-2 justify-center gap-3 justify-self-start">
                    <AvatarComponent user={friend}/>
                    <p>{friend.username}</p>
                  </div>
              ))
            }
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Chats</AccordionTrigger>
        <AccordionContent>
          <ChatList/>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}