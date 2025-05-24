import profileCardInterface from "@/interfaces/profileCard/profileCard.interface";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Link from "next/link";
import { imageFormats, path } from "@/lib/utils";

export function ProfileCard(props: profileCardInterface, ref: React.Ref<HTMLDivElement>) {
  return (
    <Card className={`min-w-56 w-56 rounded-md border self-start shadow-md bg-foreground text-color ${props.className ? props.className : ''}`} style={{...props.style, position: "static"}}>
        <div className="p-4 h-full">
          { props.cardTitle && <h4 className="mb-4 text-sm font-medium leading-none">{ props.cardTitle }</h4> }
          {
            <div className={`flex flex-col w-full items-center align-center ${!props.cardTitle && "py-2"}`}>
              <div className="rounded-sm h-5/6 w-5/6">
                <Link href={`/user/profile/${props.user.id}`}>
                {
                  props.user.profilePicture ?
                  <img src={`/images/${path.profile}/${props.user.profilePicture}.${imageFormats.profilePicture}`} alt={props.user.username} className="w-40 h-40 rounded-full object-cover" />
                  :
                  <img src="/avatar.png" alt={props.user.username} className="h-full w-full object-cover mix-blend-multiply" />
                }
                </Link>
              </div>
              <Link href={`/user/profile/${props.user.id}`} className="mb-3">
                <p className="max-w-full overflow-x-hidden">{props.user.username}</p>
              </Link>
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