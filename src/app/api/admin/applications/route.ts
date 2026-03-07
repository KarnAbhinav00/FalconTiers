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

// GET: list all applications
export async function GET(req: NextRequest) {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'

    const applications = await prisma.application.findMany({
        where: status !== 'ALL' ? { status } : undefined,
        include: { user: { select: { id: true, username: true, email: true, igName: true } } },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ applications })
}
