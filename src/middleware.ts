import { auth } from '@/app/api/auth/[nextauth]/route'
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { PUBLIC_ROUTES } from './lib/routes'

const locales = ['en', 'pt'] as const
const defaultLocale = 'en'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export default auth(async function middleware(request: NextRequest) {
  const session = await auth()
  const pathname = request.nextUrl.pathname
  const { nextUrl } = request

  // Check if current path is public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => nextUrl.pathname.includes(route))

  // Get user's preferred language
  const acceptLanguage = request.headers.get('accept-language')?.split(',')[0] || defaultLocale
  const preferredLocale = acceptLanguage.startsWith('pt') ? 'pt' : 'en'
  
  // Check if URL already has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  // If no locale in URL, redirect to preferred locale
  if (!pathnameHasLocale) {
    const newUrl = new URL(request.url)
    newUrl.pathname = `/${preferredLocale}${pathname}`
    return NextResponse.redirect(newUrl)
  }
  
  // Get current locale from URL
  const currentLocale = pathname.split('/')[1]

  // Redirecionar se não estiver autenticado e for rota privada
  if (!session && !isPublicRoute) {
    const newUrl = nextUrl.clone()
    newUrl.pathname = `/${currentLocale}/user/login`
    return NextResponse.redirect(newUrl)
  }

  // Redirecionar se já estiver autenticado e acessar login ou signup
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/feed`, nextUrl))
  }

  // Apply intl middleware with locale
  const response = intlMiddleware(request)
  
  // Add locale to response headers for client access
  response.headers.set('x-locale', currentLocale)
  
  return response
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)']
}