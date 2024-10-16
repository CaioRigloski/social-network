import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
})

export function base64toBytes(picture: string) {
  return atob(Buffer.from(picture, 'base64').toString('latin1'))
}

export const path = {
  posts: "uploads/posts",
  profile: "uploads/profile"
}