'use server'

import { signOut } from "@/app/api/auth/[nextauth]/route";

export async function signOutAction() {
  try {
    await signOut({ redirect: false })

    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      message: "Error trying to sign out"
    }
  }
}