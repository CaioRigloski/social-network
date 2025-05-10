import profileCardInterface from "@/interfaces/profileCard/profileCard.interface";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function ProfileCard(props: profileCardInterface) {
  return (
    <Card className="h-76 w-56 rounded-md border self-start shadow-md bg-foreground text-color" style={{position: "static"}}>
        <div className="p-4 h-full">
          <h4 className="mb-4 text-sm font-medium leading-none">Friend suggestions</h4>
          {
            <div className="flex flex-col w-full items-center align-center">
              <div className="rounded-sm h-5/6 w-5/6">
                <img src={props.user.profilePicture ? props.user.profilePicture : '/avatar.png'} alt={props.user.username} className="h-full w-full object-cover mix-blend-multiply"/>
              </div>
              <p className="max-w-full overflow-x-hidden pb-2">{props.user.username}</p>
              <div className="grid grid-cols-[1fr_1fr] justify-items-center w-full">
                <Button variant="secondary" className="w-11/12 h-fit px-2 py-1 text-xs" onClick={() => props.leftButtonAction()}>
                  { props.leftButtonText }
                </Button>
                <Button variant="secondary" className="w-11/12 h-fit px-2 py-1 text-xs" onClick={() => props.rightButtonAction()}>
                  { props.rightButtonText }
                </Button>
              </div>
            </div>
          }
        </div>
      </Card>
  )
}