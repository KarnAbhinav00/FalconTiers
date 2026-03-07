import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { setAuthCookie, signAuthToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(req, 'auth:register', 6, 60_000)
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please wait and try again.' },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
            )
        }

        const { username, email, password, igName } = await req.json()

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ username }, { email }] }
        })
        if (existingUser) {
            return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: 'PLAYER',
                igName: igName || username,
                displayName: username,
            }
        })

        const token = await signAuthToken({
            userId: user.id,
            username: user.username,
            role: user.role
        })

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        })

        setAuthCookie(response, token)

        return response
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }
}
