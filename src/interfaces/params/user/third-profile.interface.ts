import UserInterface from "@/interfaces/feed/user.interface";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export interface ThirdUserProfileParamsInterface extends Params, URLSearchParams {
  id: Pick<UserInterface, "id">
}