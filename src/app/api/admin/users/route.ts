import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminPayloadFromRequest } from '@/lib/auth'

// GET: list all users
export async function GET(req: NextRequest) {
    const admin = await getAdminPayloadFromRequest(req)
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
