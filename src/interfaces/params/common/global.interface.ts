export interface GlobalParamsInterface extends Omit<URLSearchParams, "get"> {
  get(name: "from"): string | null
}