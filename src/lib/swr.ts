import ChatInterface from "@/interfaces/chat/chat.interface"
import PostInterface from "@/interfaces/feed/post.interface"
import UserInterface from "@/interfaces/feed/user.interface"


export const userFetcher = (url: string): Promise<UserInterface> => fetch(url).then(r => r.json())

export const friendsFetcher = (url: string): Promise<UserInterface[]> => fetch(url).then(r => r.json())

export const friendsRequestsFetcher = (url: string): Promise<UserInterface[]> => fetch(url).then(r => r.json())

export const postsFetcher = ([url, friendsIds]: [url: string, friendsIds: string[]]): Promise<PostInterface[]> => fetch(`${url}${friendsIds.length > 0 ? `?friendIds=${friendsIds.join(",")}`: ''}`).then(r => r.json())

export const postsOfUserFetcher = (url: string): Promise<PostInterface[]> => fetch(url).then(r => r.json())

export const friendsSuggestionsFetcher = (url: string): Promise<UserInterface[]> => fetch(url).then(r => r.json())

export const chatsFetcher = (url: string): Promise<ChatInterface[]> => fetch(url).then(r => r.json())
