export const API_ROUTES = {
  user: {
    chat: {
      getChats: '/api/user/chat/get-chats',
      getChat: '/api/user/chat/get-chat'
    },
    getFriendRequests: '/api/user/get-friend-requests',
    getFriendSuggestions: '/api/user/get-friend-suggestions',
    getFriends: '/api/user/get-friends',
    getPosts: (id?: string) => id ? `/api/user/get-posts?id=${id}` : '/api/user/get-posts?id=',
    getUserInfo: '/api/user/get-user-info',
  },
  feed: {
    getPosts: '/api/feed/get-posts',
    postPublication: '/api/feed/post-publication'
  },
  search: {
    getSearch: '/api/search/get-search',
  }
} as const