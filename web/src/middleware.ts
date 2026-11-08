import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isJwtExpired } from '@/lib/jwt'

// Next 15 only runs a root `middleware.ts` exporting `middleware`.
//
// "Signed in" means holding an unexpired refresh token. The access token may
// have lapsed; the browser client refreshes it on the first 401. The dashboard
// itself checks the role (only department admins get in).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const refresh = request.cookies.get('refresh_token')?.value
  const signedIn = Boolean(refresh && !isJwtExpired(refresh, 0))

  if (pathname.startsWith('/auth')) {
    if (signedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard') && !signedIn) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
