import { auth } from "@/app/api/auth/[nextauth]/route"
import { type ClassValue, clsx } from "clsx"
import { KeyboardEvent } from "react"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const path = {
  posts: "uploads/posts",
  profile: "uploads/profile",
  public_post_images: "./public/images/uploads/posts",
  public_profile_images: "./public/images/uploads/profile"
}

export async function checkiIfIsOwnProfile(id: string) {
  const session = await auth()
  if (id === session?.user?.id) {
    return "/api/user/profile"
  } else {
    return `/api/user/profile/${id}`
  }
}

export const imageFormats = {
  posts: "jpeg",
  profilePicture: "jpeg"
}

export const toDataUrl = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
})

export function base64toBytes(picture: string) {
  return atob(Buffer.from(picture, 'base64').toString('latin1'))
}

// Check if the ENTER key is pressed.
export function detectEnterKey(event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
  if (event.key === "Enter" && !event.shiftKey) {
    return true
  }
}

