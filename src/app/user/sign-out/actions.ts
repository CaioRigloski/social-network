'use server'

import { signOut } from "@/app/api/auth/[nextauth]/route";

export async function signOutAction() {
  await signOut({ redirectTo: "/user/sign-in" })
}