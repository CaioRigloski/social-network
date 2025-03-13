export interface LoginParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "status"): "created" | null
}