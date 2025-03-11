export interface GetChatParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "id"): string | null
}