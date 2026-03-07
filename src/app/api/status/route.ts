import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public route — check if maintenance mode is on
export async function GET(_req: NextRequest) {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: 'maintenance_mode' }
        })
        const message = await prisma.siteSetting.findUnique({
            where: { key: 'maintenance_message' }
        })
        return NextResponse.json({
            maintenance: setting?.value === 'true',
            message: message?.value || 'Site is under maintenance. Check back soon.'
        })
    } catch {
        return NextResponse.json({ maintenance: false })
    }
}
