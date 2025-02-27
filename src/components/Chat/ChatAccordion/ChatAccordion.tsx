import { friendsFetcher } from "@/lib/swr"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import useSWR from "swr"
import { AvatarComponent } from "@/components/Avatar/Avatar"
import { ChatList } from "../ChatList/ChatList"
import { ScrollArea } from "@/components/ui/scroll-area"
import createOrUpdateChat from "@/app/user/chats/actions"
import UserInterface from "@/interfaces/feed/user.interface"
import { useChat } from "@/contexts/ChatContext/ChatContext"

export function ChatAccordion() {
  const { chat, addChat } = useChat()
  const friends = useSWR("/api/user/get-friends", friendsFetcher)

  async function createChat(friend: UserInterface) {
    const newChat = await createOrUpdateChat({ friendId: friend.id })
    addChat(newChat)
  }

  return (
    <Accordion type="single" collapsible className="w-[20rem]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Lets talk to someone?</AccordionTrigger>
        <AccordionContent className="">
          <ScrollArea className="h-[20rem]">
            {
              friends.data?.map(friend => (
                  <button key={friend.id} onClick={() => createChat(friend)} className="flex items-center p-2 justify-start gap-3 justify-self-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full">
                    <AvatarComponent user={friend}/>
                    <p>{friend.username}</p>
                  </button>
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