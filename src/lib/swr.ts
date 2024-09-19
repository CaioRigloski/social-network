import Post from "@/interfaces/feed/post.interface";
import User from "@/interfaces/feed/user.interface";

export const friendsRequestsFetcher = (url: string): Promise<User[]> => fetch(url).then(r => r.json())

export const postsFetcher = (url: string): Promise<Post[]> => fetch(url).then(r => r.json())

export const friendsSuggestionsFetcher = (url: string): Promise<User[]> => fetch(url).then(r => r.json())