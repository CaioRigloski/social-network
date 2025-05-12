import { createNewLike } from "@/app/post/like/actions"
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
  
  if(Array.isArray(key)) console.log(key[0])


  if(key === API_ROUTES.feed.getPosts) {
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