import profileCardInterface from "@/interfaces/profileCard/profileCard.interface";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function ProfileCard(props: profileCardInterface, ref: React.Ref<HTMLDivElement>) {
  return (
    <Card className={`${props.className} h-76 w-56 rounded-md border self-start shadow-md bg-foreground text-color`} style={{...props.style, position: "static"}}>
        <div className="p-4 h-full">
          <h4 className="mb-4 text-sm font-medium leading-none">{ props.cardTitle }</h4>
          {
            <div className="flex flex-col w-full items-center align-center">
              <div className="rounded-sm h-5/6 w-5/6">
                <img src={props.user.profilePicture ? props.user.profilePicture : '/avatar.png'} alt={props.user.username} className="h-full w-full object-cover mix-blend-multiply"/>
              </div>
              <p className="max-w-full overflow-x-hidden pb-2">{props.user.username}</p>
              <div className={`grid ${props.leftButtonText && props.rightButtonText ? "grid-cols-[1fr_1fr]" : "grid-cols-1"} justify-items-center w-full`}>
                {
                  props.leftButtonText && props.leftButtonAction &&
                  <Button variant="secondary" className="w-11/12 h-fit px-2 py-1 text-xs" onClick={() => props.leftButtonAction && props.leftButtonAction()}>
                    { props.leftButtonText }
                  </Button>
                }
                {
                  props.rightButtonText && props.rightButtonAction &&
                  <Button variant="destructive" className="w-11/12 h-fit px-2 py-1 text-xs" onClick={() => props.rightButtonAction && props.rightButtonAction()}>
                    { props.rightButtonText }
                  </Button>
                }
              </div>
            </div>
          }
        </div>
      </Card>
  )
}