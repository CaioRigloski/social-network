export const API_ROUTES = {
  posts: '/api/posts',

  search: (query?: string, posts?: boolean, users?: boolean) =>
    `/api/search?query=${query ?? ''}&posts=${posts ?? ''}&users=${users ?? ''}`,

  users: (userId: string) => ({
    chats: (chatId?: string) => `/api/users/${userId}/chats/${chatId ? chatId : ''}`,
    friendRequests: `/api/users/${userId}/friend-requests`,
    friendSuggestions: `/api/users/${userId}/friend-suggestions`,
    friends: `/api/users/${userId}/friends`,
    posts: `/api/users/${userId}/posts`,
  }),
} as const