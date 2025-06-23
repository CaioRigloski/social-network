import { createNewComment, deleteComment, editComment } from "@/components/Post/Comment/actions"
import CommentInterface from "@/interfaces/post/comment/comment.interface"
import PostInterface from "@/interfaces/post/post.interface"
import SearchResultInterface from "@/interfaces/search/searchResult/searchResult.interface"
import { getKeys } from "@/lib/utils"
import { Session } from "next-auth"
import { Key, mutate } from "swr"

export function useComment(session: Session | null) {
  const { userPostsKey, postsBaseKey, searchBaseKey } = getKeys(session)

  async function create(postId: string, comment: string, key: Key) {
    function mutateComment(data: PostInterface[] | undefined, newComment: CommentInterface | undefined) {
      return data?.map(post => {
        if (post.id === postId && newComment) {
          return {
            ...post,
            comments: [newComment, ...post.comments],
            commentsCount: post.commentsCount + 1
          }
        }
        return post
      })
    }

    if(key === userPostsKey || (postsBaseKey && key?.toString().startsWith(postsBaseKey))) {
      createNewComment({postId: postId, text: comment}).then((newComment) => 
        mutate<PostInterface[]>(key, data => mutateComment(data, newComment), false)
      )
    }

    if(key?.toString().startsWith(searchBaseKey)) {
      createNewComment({postId: postId, text: comment}).then((newComment) => {
        mutate<SearchResultInterface>(key, data => {
          return {
            ...data,
            posts: mutateComment(data?.posts, newComment)
          }
        }, false)
      })
    }
  }
  
  async function edit(postId: string, commentId: string, editedComment: string, key: Key) {
    function mutateComment(data: PostInterface[] | undefined) {
      return data?.map(post => {
        if(post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, text: editedComment }
                : comment
            )
          }
        }

        return post
      })
    }

    if(key === userPostsKey || (postsBaseKey && key?.toString().startsWith(postsBaseKey))) {
      editComment({ commentId: commentId, text: editedComment }).then(() => {
        mutate<PostInterface[]>(key, data => mutateComment(data), false)
      })
    }

    if(key?.toString().startsWith(searchBaseKey)) {
      editComment({ commentId: commentId, text: editedComment }).then(() => {
        mutate<SearchResultInterface>(key, data => {
          if (data) {
            return {
              ...data,
              posts: mutateComment(data.posts)
            }
          }
          return data
        }, false)
      })
    }
  }

  async function remove(postId: string, commentId: string, key: Key) {
    function mutateComment(data: PostInterface[] | undefined) {
      return data?.map(post => {
        if(post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(comment => comment.id !== commentId),
            commentsCount: post.commentsCount - 1
          }
        }
        return post
      })
    }

    if(key === userPostsKey || (postsBaseKey && key?.toString().startsWith(postsBaseKey))) {
      deleteComment({ commentId: commentId }).then(() => {
        mutate<PostInterface[]>(key, data => mutateComment(data), false)
      })
    }

    if(key?.toString().startsWith(searchBaseKey)) {
      deleteComment({ commentId: commentId }).then(() => {
        mutate<SearchResultInterface>(key, data => {
          return {
            ...data,
            posts: mutateComment(data?.posts)
          }
        }, false)
      })
    }
  }

  return { create, edit, remove }
}