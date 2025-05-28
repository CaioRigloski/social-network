import { createNewLike, unlike as unlikeAction } from "@/components/Post/Like/actions"
import LikeInterface from "@/interfaces/post/like/like.interface"
import PostInterface from "@/interfaces/post/post.interface"
import SearchResultInterface from "@/interfaces/search/searchResult/searchResult.interface"
import { API_ROUTES } from "@/lib/apiRoutes"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import { Key, mutate } from "swr"

function getKeys(session: Session | null) {
    const userPostsKey = session?.user ? API_ROUTES.users(session.user.id).posts : undefined
    const postsBaseKey = session?.user ? API_ROUTES.posts : undefined

    console.log(userPostsKey )
    return { userPostsKey, postsBaseKey }
}

export function useLike(session: Session | null) {
  async function like(postId: string, key: Key) {
    const { userPostsKey, postsBaseKey} = getKeys(session)
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
    console.log(key)
  
    if(key === userPostsKey || (postsBaseKey && key?.toString().startsWith(postsBaseKey))) {
      createNewLike({postId: postId}).then((newLike) => {
        mutate<PostInterface[]>(key, data => mutatePost(data, newLike), false)
      })
    }
  
    if(Array.isArray(key) && key[0] === API_ROUTES.search()) {
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
  
  async function unlike(postId: string, likeId: string, key: Key) {
    const { userPostsKey, postsBaseKey} = getKeys(session)
  
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
    console.log(key)
    if(key === userPostsKey || (postsBaseKey && key?.toString().startsWith(postsBaseKey))) {
      unlikeAction({postId: postId, likeId: likeId}).then(() => 
        mutate<PostInterface[]>(key, data => mutatePost(data, likeId), false)
      )
    }
  
    if(Array.isArray(key) && key[0] === API_ROUTES.search()) {
      unlikeAction({postId: postId, likeId: likeId}).then((newLike) => {
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

  return { like, unlike }
}