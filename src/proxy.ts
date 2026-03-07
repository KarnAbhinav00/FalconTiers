import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'falcon-tiers-secret-2024')

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.redirect(new URL('/login?from=admin', req.url))

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
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
