import NextAuth from 'next-auth'
import { auth } from '@/app/api/auth/[nextauth]/route'
import { NextResponse } from 'next/server'
import { AUTHENTICATED_REDIRECT, PUBLIC_ROUTES } from './lib/routes'


export default auth((req) => {
 const { nextUrl } = req

 const isAuthenticated = !!req.auth
 const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)

 if(nextUrl.pathname === "/") {
  return NextResponse.redirect(new URL("/user/sign-in", nextUrl))
 }

 if (!isAuthenticated && isPublicRoute) {
   return NextResponse.next()
 }

 if (!isAuthenticated && nextUrl.pathname != "/user/sign-in") {
   return NextResponse.redirect(new URL("/user/sign-in", nextUrl))
 }

 if(isAuthenticated && AUTHENTICATED_REDIRECT.includes(nextUrl.pathname)) {
  return NextResponse.redirect(new URL("/feed", nextUrl))
 }
})

export const config = {
 matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}