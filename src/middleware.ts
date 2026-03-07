import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'falcon-tiers-secret-2024')

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Admin panel — requires ADMIN role
    if (pathname.startsWith('/admin')) {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.redirect(new URL('/login?from=admin', req.url))
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET)
            if (payload.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url))
            return NextResponse.next()
        } catch {
            return NextResponse.redirect(new URL('/login?from=admin', req.url))
        }
    }

    // Admin API — requires ADMIN role
    if (pathname.startsWith('/api/admin')) {
        const token = req.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET)
            if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            return NextResponse.next()
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
}
