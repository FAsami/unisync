import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_COOKIE,
  apiUrl,
  envelopeError,
  isSameOrigin,
} from '@/lib/session/server'

export const dynamic = 'force-dynamic'

/**
 * Same-origin proxy to the API for the browser. It adds the access token from
 * the httpOnly cookie, so page scripts never hold a token and the API needs no
 * CORS. Sign-in endpoints are not exposed here (their responses carry tokens):
 * they run in server actions (src/actions/session.ts).
 */
const handler = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params
  if (
    path[0] === 'auth' ||
    path.some((segment) => segment === '.' || segment === '..')
  ) {
    return NextResponse.json(envelopeError('NOT_FOUND', 'Not found.'), {
      status: 404,
    })
  }

  const reading = request.method === 'GET' || request.method === 'HEAD'
  if (!reading && !isSameOrigin(request)) {
    return NextResponse.json(envelopeError('FORBIDDEN', 'Not allowed.'), {
      status: 403,
    })
  }

  const target = `${apiUrl()}/api/v1/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`
  const headers = new Headers({ Accept: 'application/json' })
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('Content-Type', contentType)
  const token = request.cookies.get(ACCESS_COOKIE)?.value
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: reading ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    })
  } catch {
    return NextResponse.json(
      envelopeError(
        'API_UNREACHABLE',
        'UniSync is not reachable right now. Try again in a moment.'
      ),
      { status: 502 }
    )
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
}
