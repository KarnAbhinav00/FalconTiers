import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runtimeDeleteRanking, runtimeUpdateRanking } from '@/lib/runtimeStore'
import { getAdminPayloadFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

// PUT /api/admin/players/[id] - update a player ranking
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rl = rateLimit(req, 'admin:players:id:update', 90, 60_000)
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many requests. Try again shortly.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
    }

    const admin = await getAdminPayloadFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    let rankingId = -1
    let rank: number | undefined
    let points: number | undefined
    let badges: string[] | undefined
    let displayName: string | undefined
    let avatarUrl: string | undefined

    try {
        const { id } = await params
        rankingId = parseInt(id)
        const body = await req.json()
        rank = body.rank
        points = body.points
        badges = body.badges
        displayName = body.displayName
        avatarUrl = body.avatarUrl

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

        const desiredRank = rank !== undefined ? Number(rank) : undefined
        if (desiredRank !== undefined && (!Number.isFinite(desiredRank) || desiredRank < 1)) {
            return NextResponse.json({ error: 'rank must be a positive number' }, { status: 400 })
        }

        let updated
        await prisma.$transaction(async (tx) => {
            if (desiredRank !== undefined) {
                const categoryCount = await tx.playerRanking.count({ where: { category: ranking.category } })
                const maxRank = Math.max(categoryCount, 1)
                const targetRank = Math.min(Math.max(Math.floor(desiredRank), 1), maxRank)

                if (targetRank < ranking.rank) {
                    await tx.playerRanking.updateMany({
                        where: { category: ranking.category, rank: { gte: targetRank, lt: ranking.rank } },
                        data: { rank: { increment: 1 } },
                    })
                } else if (targetRank > ranking.rank) {
                    await tx.playerRanking.updateMany({
                        where: { category: ranking.category, rank: { gt: ranking.rank, lte: targetRank } },
                        data: { rank: { decrement: 1 } },
                    })
                }

                updated = await tx.playerRanking.update({
                    where: { id: rankingId },
                    data: {
                        rank: targetRank,
                        ...(points !== undefined && { points: Number(points) }),
                        ...(badges !== undefined && { badges: JSON.stringify(badges) }),
                    },
                    include: { player: true }
                })
            } else {
                updated = await tx.playerRanking.update({
                    where: { id: rankingId },
                    data: {
                        ...(points !== undefined && { points: Number(points) }),
                        ...(badges !== undefined && { badges: JSON.stringify(badges) }),
                    },
                    include: { player: true }
                })
            }
        })

        return NextResponse.json({
            success: true,
            ranking: { ...updated!, badges: JSON.parse(updated!.badges) }
        })
    } catch (error) {
        console.error('Update player error:', error)
        const fallback = runtimeUpdateRanking(rankingId, {
            rank: rank !== undefined ? Number(rank) : undefined,
            points: points !== undefined ? Number(points) : undefined,
            badges: badges !== undefined ? badges : undefined,
            displayName,
            avatarUrl,
        })
        if (!fallback) return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })
        return NextResponse.json({
            success: true,
            ranking: { ...fallback.ranking, player: fallback.player, degraded: true },
        })
    }
}

// DELETE /api/admin/players/[id] - delete a player ranking
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rl = rateLimit(req, 'admin:players:id:delete', 60, 60_000)
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many requests. Try again shortly.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
    }

    const admin = await getAdminPayloadFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    let rankingId = -1

    try {
        const { id } = await params
        rankingId = parseInt(id)

        const ranking = await prisma.playerRanking.findUnique({ where: { id: rankingId } })
        if (!ranking) return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })

        await prisma.$transaction([
            prisma.playerRanking.delete({ where: { id: rankingId } }),
            prisma.playerRanking.updateMany({
                where: { category: ranking.category, rank: { gt: ranking.rank } },
                data: { rank: { decrement: 1 } },
            }),
        ])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        const ok = runtimeDeleteRanking(rankingId)
        if (!ok) return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })
        return NextResponse.json({ success: true, degraded: true })
    }
}
