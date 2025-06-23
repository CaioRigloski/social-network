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
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"


export function ChatAccordion() {
  const t = useTranslations()

  const session = useSession()

  const { addChat } = useChat()

  const friends = useSWR(session.data && API_ROUTES.users(session.data?.user.id).friends, friendsFetcher)

  async function newChat(friend: UserInterface) {
    const newChat = await createChat({ friendId: friend.id })
    addChat(newChat)
  }

  return (
    <Accordion type="single" collapsible className="w-[20rem] shadow-md bg-foreground text-color rounded-md">
      <AccordionItem value="item-1">
        <AccordionTrigger className="p-4">{ t('chat.letsTalkToSomeone') }</AccordionTrigger>
        <AccordionContent>
          {
            friends.data?.length === 0 ?
            <p className="text-center">{ t('chat.noFriendsToTalk') }</p>
            :
            <ScrollArea className="h-[20rem]">
            {
              friends.data?.map(friend => (
                  <button key={friend.id} onClick={() => newChat(friend)} className="group/avatar flex items-center p-2 justify-start gap-3 justify-self-start hover:bg-primary-foreground hover:text-color-secondary w-11/12 rounded-lg justify-self-center">
                    <AvatarComponent user={friend}/>
                    <p>{friend.username}</p>
                  </button>
              )) 
            }
            </ScrollArea>
          }
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="p-4">{ t('chat.chats') }</AccordionTrigger>
        <AccordionContent>
          <ChatList/>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}