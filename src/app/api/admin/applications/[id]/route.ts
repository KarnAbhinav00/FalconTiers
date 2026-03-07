import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminPayloadFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

// PUT /api/admin/applications/[id] - approve or reject
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rl = rateLimit(req, 'admin:apps:update', 60, 60_000)
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many requests. Try again shortly.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
    }

    const admin = await getAdminPayloadFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { status, adminNote } = await req.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Status must be APPROVED or REJECTED' }, { status: 400 })
    }

    const application = await prisma.application.update({
        where: { id: parseInt(id) },
        data: { status, adminNote: adminNote || '' },
        include: { user: { select: { username: true, igName: true } } }
    })

    return NextResponse.json({ success: true, application })
}
