import { createNewLike, unlike } from "@/app/post/like/actions"
import LikeInterface from "@/interfaces/post/like/like.interface"
import PostInterface from "@/interfaces/post/post.interface"
import SearchResultInterface from "@/interfaces/search/searchResult/searchResult.interface"
import { API_ROUTES } from "@/lib/apiRoutes"
import { Key, mutate } from "swr"

export async function useLikeMutation(postId: string, key: Key) {
  function mutatePost(data: PostInterface[] | undefined, newLike: LikeInterface | undefined) {
    return data?.map(post => {
      if (post.id === postId && newLike) {
        return {
          ...post,
          likes: [newLike, ...post.likes],
          likesCount: post.likesCount + 1
        }
      }
      return post
    })
  }

  if(key === API_ROUTES.feed.getPosts || key?.toString().startsWith(API_ROUTES.user.getPosts())) {
    createNewLike({postId: postId}).then((newLike) => {
      mutate<PostInterface[]>(key, data => mutatePost(data, newLike), false)
    })
  }

  if(Array.isArray(key) && key[0] === API_ROUTES.search.getSearch) {
    createNewLike({postId: postId}).then((newLike) => {
      mutate<SearchResultInterface>(key, data => {
        if (data) {
          return {
            ...data,
            posts: mutatePost(data.posts, newLike)
          };
        }
        return data;
      }, false)
    })
  }
}

export async function useUnlikeMutation(postId: string, likeId: string, key: Key) {
  function mutatePost(data: PostInterface[] | undefined, likeId: string) {
    return data?.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes.filter(like => like.id !== likeId),
          likesCount: post.likesCount - 1
        }
      }
      return post
    })
  }

  if(key === API_ROUTES.feed.getPosts || key?.toString().startsWith(API_ROUTES.user.getPosts())) {
    unlike({postId: postId, likeId: likeId}).then(() => 
      mutate<PostInterface[]>(key, data => mutatePost(data, likeId), false)
    )
  }

  if(Array.isArray(key) && key[0] === API_ROUTES.search.getSearch) {
    unlike({postId: postId, likeId: likeId}).then((newLike) => {
      mutate<SearchResultInterface>(key, data => {
        if (data) {
          return {
            ...data,
            posts: mutatePost(data.posts, likeId)
          };
        }
        return data;
      }, false)
    })
  }
}