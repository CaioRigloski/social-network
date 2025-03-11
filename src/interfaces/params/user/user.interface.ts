export interface UserParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "id"): string | null
}