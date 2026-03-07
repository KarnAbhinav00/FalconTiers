import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminPayloadFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

// POST /api/admin/users/[id]/ban - ban or unban a user
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
    const rl = rateLimit(req, 'admin:users:action', 40, 60_000)
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many requests. Try again shortly.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
    }

    const admin = await getAdminPayloadFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, action } = await params
    const userId = parseInt(id)

    // Prevent banning another admin
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (targetUser.role === 'ADMIN') return NextResponse.json({ error: 'Cannot ban an admin' }, { status: 403 })

    if (action === 'ban') {
        const { reason } = await req.json()
        await prisma.user.update({
            where: { id: userId },
            data: { isBanned: true, banReason: reason || 'Banned by admin' }
        })
        return NextResponse.json({ success: true, message: `${targetUser.username} has been banned` })
    }

    if (action === 'unban') {
        await prisma.user.update({
            where: { id: userId },
            data: { isBanned: false, banReason: '' }
        })
        return NextResponse.json({ success: true, message: `${targetUser.username} has been unbanned` })
    }

    if (action === 'cleardata') {
        // Clear all rankings of the player linked to this user
        const player = await prisma.player.findFirst({ where: { userId } })
        if (player) {
            await prisma.playerRanking.deleteMany({ where: { playerId: player.id } })
        }
        // Clear their applications
        await prisma.application.deleteMany({ where: { userId } })
        // Reset profile
        await prisma.user.update({
            where: { id: userId },
            data: { displayName: targetUser.username, bio: '', avatarUrl: '' }
        })
        return NextResponse.json({ success: true, message: `All data cleared for ${targetUser.username}` })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
