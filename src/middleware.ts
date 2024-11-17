import { auth } from '@/app/api/auth/[nextauth]/route'
import { NextResponse } from 'next/server'
import { AUTHENTICATED_REDIRECT, PUBLIC_ROUTES, SIGN_IN_URL } from './lib/routes'


export default auth((req) => {
 const { nextUrl } = req

 const from = nextUrl.searchParams.get("from")
 // Check if is authenticated
 const isAuthenticated = !!req.auth

 // Check if current path is public route
 const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)

 // No main page is used, so it redirects to a page with credentials check
 if(nextUrl.pathname === "/") {
  return NextResponse.redirect(new URL(SIGN_IN_URL, nextUrl))
 }

 // If it's a public path can be continued
 if (!isAuthenticated && isPublicRoute) {
   return NextResponse.next()
 }

 // If it's not authenticated and path is not already for sign-in (to prevent loop), it's redirected.
 if (!isAuthenticated && nextUrl.pathname != "/user/sign-in") {
   return NextResponse.redirect(new URL(SIGN_IN_URL + `/?from=${nextUrl.pathname}`, nextUrl))
 }

 // If authenticated gets the search param to continue with it if exists or goes to /feed
 if(isAuthenticated && AUTHENTICATED_REDIRECT.includes(nextUrl.pathname)) {
  return NextResponse.redirect(new URL(from ? from: "/feed", nextUrl))
 }
})

export const config = {
 matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}