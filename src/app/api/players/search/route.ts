import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const q = searchParams.get('q')?.trim()

        if (!q || q.length < 2) {
            return NextResponse.json({ results: [] })
        }

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
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}
