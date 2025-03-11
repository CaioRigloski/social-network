export interface GetPostsParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "friendsIds"): string | null
}