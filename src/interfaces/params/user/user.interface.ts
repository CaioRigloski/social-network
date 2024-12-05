import UserInterface from "@/interfaces/feed/user.interface";

export interface UserParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "id"): string | null
}