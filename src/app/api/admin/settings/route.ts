import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminPayloadFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

// GET: get all settings
export async function GET(req: NextRequest) {
    const admin = await getAdminPayloadFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.siteSetting.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value
    return NextResponse.json({ settings: map })
}

// POST: upsert a setting
export async function POST(req: NextRequest) {
    const rl = rateLimit(req, 'admin:settings:update', 40, 60_000)
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many requests. Try again shortly.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
    }

    const admin = await getAdminPayloadFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { key, value } = await req.json()
    if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

    const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    })

    return NextResponse.json({ success: true, setting })
}
