import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'falcon-tiers-secret-2024')

async function getAdminUser(req: NextRequest) {
    const token = req.cookies.get('token')?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        if (payload.role !== 'ADMIN') return null
        return payload
    } catch { return null }
}

// GET: list all users
export async function GET(req: NextRequest) {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const users = await prisma.user.findMany({
        where: { role: { not: 'ADMIN' } },
        select: {
            id: true, username: true, email: true, igName: true,
            displayName: true, isBanned: true, banReason: true,
            role: true, createdAt: true, avatarUrl: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
}
