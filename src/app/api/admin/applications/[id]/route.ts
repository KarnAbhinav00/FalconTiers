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

// PUT /api/admin/applications/[id] - approve or reject
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await getAdminUser(req)
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
