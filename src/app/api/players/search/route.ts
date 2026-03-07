import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runtimeSearchPlayers } from '@/lib/runtimeStore'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''

    if (q.length < 2) {
        return NextResponse.json({ results: [] })
    }

    try {
        const players = await prisma.player.findMany({
            where: {
                OR: [
                    { displayName: { contains: q } },
                    { username: { contains: q } },
                ]
            },
            include: {
                rankings: {
                    orderBy: { rank: 'asc' }
                }
            },
            take: 20,
        })

        const results = players.map(p => ({
            id: p.id,
            username: p.username,
            displayName: p.displayName,
            avatarUrl: p.avatarUrl,
            rankings: p.rankings.map(r => ({
                category: r.category,
                rank: r.rank,
                points: r.points,
                badges: JSON.parse(r.badges),
            }))
        }))

        return NextResponse.json({ results })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ results: runtimeSearchPlayers(q), degraded: true })
    }
}
