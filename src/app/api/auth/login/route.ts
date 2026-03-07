import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'falcon-tiers-secret-2024')
const FALLBACK_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const FALLBACK_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

async function signAuthToken(userId: number, username: string, role: string) {
    return new SignJWT({ userId, username, role })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET)
}

function authResponse(token: string, user: { id: number; username: string; role: string }) {
    const response = NextResponse.json({ success: true, user })
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })
    return response
}

export async function POST(req: NextRequest) {
    const { username, password } = await req.json()

    if (!username || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } })

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = await signAuthToken(user.id, user.username, user.role)
            return authResponse(token, { id: user.id, username: user.username, role: user.role })
        }
    } catch (error) {
        console.error('Login error:', error)
    }

    if (username === FALLBACK_ADMIN_USERNAME && password === FALLBACK_ADMIN_PASSWORD) {
        const token = await signAuthToken(0, FALLBACK_ADMIN_USERNAME, 'ADMIN')
        return authResponse(token, { id: 0, username: FALLBACK_ADMIN_USERNAME, role: 'ADMIN' })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
