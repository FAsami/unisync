import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isJwtExpired } from '@/lib/jwt'

// Next 15 only runs a root `middleware.ts` exporting `middleware`. This file was
// previously `proxy.ts` (the Next 16 name) and therefore never executed.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const raw = request.cookies.get('access_token')?.value
  // An expired token must not count as logged in, or a user whose token lapsed
  // would be bounced away from /auth/login and could never sign in again.
  const token = raw && !isJwtExpired(raw, 0) ? raw : undefined

  if (pathname.startsWith('/auth')) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
