'use client'

import { newFriendSchema, newPostSchema } from './feed.types'
import { toBase64 } from '@/lib/utils'
import { z } from 'zod'


export async function createNewPost(values: z.infer<typeof newPostSchema>, inputImage: File, userId: number) {
  const imageAsBase64 = inputImage && await toBase64(inputImage)

  const newValues = {
    ...values,
    userId: userId,
    picture: btoa(imageAsBase64 as string)
  }

  try {
    const response = await fetch("/api/feed/post-publication", {
        method: "POST",
        body: JSON.stringify(newValues)
    })
    console.log(response)
  } catch (err) {
    console.log(err)
  }
}

export async function addNewFriend(values: z.infer<typeof newFriendSchema>) {
  console.log(values)
  try {
    const response = await fetch("/api/user/accept-friend-request", {
      method: "PUT",
      body: JSON.stringify(values)
    })
  } catch (err) {
    console.log(err)
  }
}