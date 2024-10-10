import PostInterface from "@/interfaces/feed/post.interface";
import Post from "@/interfaces/feed/post.interface";
import UserInterface from "@/interfaces/feed/user.interface";

export const friendsFetcher = (url: string): Promise<UserInterface[]> => fetch(url).then(r => r.json())

export const friendsRequestsFetcher = (url: string): Promise<UserInterface[]> => fetch(url).then(r => r.json())

export const postsFetcher = (url: string): Promise<PostInterface[]> => fetch(url).then(r => r.json())

export const postsOfUserFetcher = (url: string): Promise<Post[]> => fetch(url).then(r => r.json())

export const friendsSuggestionsFetcher = (url: string): Promise<UserInterface[]> => fetch(url).then(r => r.json())