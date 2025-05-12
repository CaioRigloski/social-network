import ChatInterface from "@/interfaces/chat/chat.interface"
import PostInterface from "@/interfaces/post/post.interface"
import UserInterface from "@/interfaces/feed/user.interface"
import SearchResultInterface from "@/interfaces/search/searchResult/searchResult.interface"
import SearchInterface from "@/interfaces/search/search.interface"

async function fetcherErrorHandler<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    const errorData = await response.json()
    const error = new Error(errorData.error || 'An error occurred');
    (error as any).details = errorData.details;
    (error as any).status = response.status;
    throw error
  }

  return response.json()
}

export const userFetcher = (url: string): Promise<UserInterface> => 
  fetcherErrorHandler<UserInterface>(url)

export const friendsFetcher = (url: string): Promise<UserInterface[]> => 
  fetcherErrorHandler<UserInterface[]>(url)

export const friendsRequestsFetcher = (url: string): Promise<UserInterface[]> => 
  fetcherErrorHandler<UserInterface[]>(url)

export const postsFetcher = (url: string, friendsIds?: string[]): Promise<PostInterface[]> => 
  fetcherErrorHandler<PostInterface[]>(
    `${url}${friendsIds && friendsIds.length > 0 ? `?friendsIds=${friendsIds.join(",")}`: ''}`
  )

export const postsOfUserFetcher = (url: string): Promise<PostInterface[]> => 
  fetcherErrorHandler<PostInterface[]>(url)

export const friendsSuggestionsFetcher = (url: string): Promise<UserInterface[]> => 
  fetcherErrorHandler<UserInterface[]>(url)

export const chatsFetcher = (url: string): Promise<ChatInterface[]> => 
  fetcherErrorHandler<ChatInterface[]>(url)

export const chatFetcher = ([url, id]: [url: string, id: string]): Promise<ChatInterface> => 
  fetcherErrorHandler<ChatInterface>(`${url}?id=${id}`)

export const searchFetcher = (url: string, query: string, posts?: boolean, users?: boolean): Promise<SearchResultInterface> => 
  fetcherErrorHandler<SearchInterface>(
    `${url}?query=${query}${posts ? `&posts=true` : ''}${users ? `&users=true` : ''}`
  )