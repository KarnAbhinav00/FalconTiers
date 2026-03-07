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
    } catch {
        return null
    }
}

// PUT /api/admin/players/[id] - update a player ranking
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const rankingId = parseInt(id)
        const { rank, points, badges, displayName, avatarUrl } = await req.json()

        const ranking = await prisma.playerRanking.findUnique({
            where: { id: rankingId },
            include: { player: true }
        })

        if (!ranking) return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })

        // Update player info if provided
        if (displayName || avatarUrl !== undefined) {
            await prisma.player.update({
                where: { id: ranking.playerId },
                data: {
                    ...(displayName && { displayName }),
                    ...(avatarUrl !== undefined && { avatarUrl }),
                }
            })
        }

        // Update ranking
        const updated = await prisma.playerRanking.update({
            where: { id: rankingId },
            data: {
                ...(rank !== undefined && { rank: parseInt(rank) }),
                ...(points !== undefined && { points: parseInt(points) }),
                ...(badges !== undefined && { badges: JSON.stringify(badges) }),
            },
            include: { player: true }
        })

        return NextResponse.json({
            success: true,
            ranking: { ...updated, badges: JSON.parse(updated.badges) }
        })
    } catch (error) {
        console.error('Update player error:', error)
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

// DELETE /api/admin/players/[id] - delete a player ranking
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const rankingId = parseInt(id)

        await prisma.playerRanking.delete({ where: { id: rankingId } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
