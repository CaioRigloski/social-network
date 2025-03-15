import { friendsFetcher } from "@/lib/swr"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import useSWR from "swr"
import { AvatarComponent } from "@/components/Avatar/Avatar"
import { ChatList } from "../ChatList/ChatList"
import { ScrollArea } from "@/components/ui/scroll-area"
import UserInterface from "@/interfaces/feed/user.interface"
import { useChat } from "@/contexts/ChatContext/ChatContext"
import { createChat } from "../actions"
import { API_ROUTES } from "@/lib/apiRoutes"

export function ChatAccordion() {
  const { addChat } = useChat()
  const friends = useSWR(API_ROUTES.user.getFriends, friendsFetcher)

  async function newChat(friend: UserInterface) {
    const newChat = await createChat({ friendId: friend.id })
    addChat(newChat)
  }

  return (
    <Accordion type="single" collapsible className="w-[20rem] shadow-md">
      <AccordionItem value="item-1">
        <AccordionTrigger className="p-4">Lets talk to someone?</AccordionTrigger>
        <AccordionContent className="">
          <ScrollArea className="h-[20rem]">
            {
              friends.data?.map(friend => (
                  <button key={friend.id} onClick={() => newChat(friend)} className="flex items-center p-2 justify-start gap-3 justify-self-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full">
                    <AvatarComponent user={friend}/>
                    <p>{friend.username}</p>
                  </button>
              ))
            }
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="p-4">Chats</AccordionTrigger>
        <AccordionContent>
          <ChatList/>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}