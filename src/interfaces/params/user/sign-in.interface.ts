export interface SignInParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "status"): string | null
}