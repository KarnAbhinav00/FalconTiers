import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getFallbackAdminCredentials, setAuthCookie, signAuthToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

function authResponse(token: string, user: { id: number; username: string; role: string }) {
    const response = NextResponse.json({ success: true, user })
    setAuthCookie(response, token)
    return response
}

export async function POST(req: NextRequest) {
    const rl = rateLimit(req, 'auth:login', 10, 60_000)
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many login attempts. Please wait and try again.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
    }

    const { username, password } = await req.json()

    if (!username || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } })

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = await signAuthToken({ userId: user.id, username: user.username, role: user.role })
            return authResponse(token, { id: user.id, username: user.username, role: user.role })
        }
    } catch (error) {
        console.error('Login error:', error)
    }

    const fallbackAdmin = getFallbackAdminCredentials()
    if (fallbackAdmin && username === fallbackAdmin.username && password === fallbackAdmin.password) {
        const token = await signAuthToken({ userId: 0, username: fallbackAdmin.username, role: 'ADMIN' })
        return authResponse(token, { id: 0, username: fallbackAdmin.username, role: 'ADMIN' })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
