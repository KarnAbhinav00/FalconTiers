import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.redirect(new URL('/login?from=admin', req.url))

    try {
      const payload = await verifyAuthToken(token)
      if (payload.role !== 'ADMIN') {
        const response = NextResponse.redirect(new URL('/login?from=admin', req.url))
        response.cookies.set('token', '', { path: '/', maxAge: 0, httpOnly: true })
        return response
      }
    } catch {
      const response = NextResponse.redirect(new URL('/login?from=admin', req.url))
      response.cookies.set('token', '', { path: '/', maxAge: 0, httpOnly: true })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
