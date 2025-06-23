import { auth } from "@/app/api/auth/[nextauth]/route"
import { type ClassValue, clsx } from "clsx"
import { Session } from "next-auth"
import { KeyboardEvent } from "react"
import { twMerge } from "tailwind-merge"
import { API_ROUTES } from "./apiRoutes"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const path = {
  posts: "uploads/posts",
  profile: "uploads/profile",
  public_post_images: "./public/images/uploads/posts",
  public_profile_images: "./public/images/uploads/profile"
}

export const imageFormats = {
  posts: "jpeg",
  profilePicture: "jpeg"
}

export function toDataUrl(file:File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to data URL"));
      }
    }
    reader.onerror = reject
  })
}

export function base64toBytes(picture: string) {
  return atob(Buffer.from(picture, 'base64').toString('latin1'))
}

// Check if the ENTER key is pressed.
export function detectEnterKey(event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    return true
  }
}

export function formatDate(date: Date) {
    const today = new Date()
    const isToday = new Date(date).toDateString() === today.toDateString()
    
    if (isToday) {
      return `Today ${new Date(date).toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", "")}`
    } else {
      return new Date(date).toLocaleTimeString(navigator.language, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", "")
    }
  }

export function getKeys(session: Session | null) {
    const userPostsKey = session?.user ? API_ROUTES.users(session.user.id).posts : undefined
    const postsBaseKey = session?.user ? API_ROUTES.posts : undefined
    const searchBaseKey = API_ROUTES.search(false, false, '').split("?")[0]

    return { userPostsKey, postsBaseKey, searchBaseKey }
}