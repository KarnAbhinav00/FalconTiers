import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'falcon-tiers-secret-2024')

export async function POST(req: NextRequest) {
    try {
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

        const token = await new SignJWT({
            userId: user.id,
            username: user.username,
            role: user.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(JWT_SECRET)

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        })

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }
}
