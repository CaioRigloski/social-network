import { type ClassValue, clsx } from "clsx"
import { RefObject } from "react";
import { twMerge } from "tailwind-merge"
import { ZodObject } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
})