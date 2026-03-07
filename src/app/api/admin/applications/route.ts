import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminPayloadFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

// GET: list all applications
export async function GET(req: NextRequest) {
    const admin = await getAdminPayloadFromRequest(req)
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

// DELETE: purge pending/rejected applications
export async function DELETE(req: NextRequest) {
    const rl = rateLimit(req, 'admin:apps:delete', 20, 60_000)
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many requests. Try again shortly.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
    }

    const admin = await getAdminPayloadFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode') || 'pending_rejected'

    if (mode === 'all') {
        const result = await prisma.application.deleteMany({})
        return NextResponse.json({ success: true, deleted: result.count })
    }

    const result = await prisma.application.deleteMany({
        where: { status: { in: ['PENDING', 'REJECTED'] } }
    })
    return NextResponse.json({ success: true, deleted: result.count })
}
