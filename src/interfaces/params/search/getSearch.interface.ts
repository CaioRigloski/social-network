export interface GetSearchParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "query" | "users" | "posts"): string | null
}