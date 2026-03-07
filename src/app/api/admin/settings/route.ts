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

// GET: get all settings
export async function GET(req: NextRequest) {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.siteSetting.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value
    return NextResponse.json({ settings: map })
}

// POST: upsert a setting
export async function POST(req: NextRequest) {
    const admin = await getAdminUser(req)
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
