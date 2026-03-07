import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runtimeGetCategoryRankings } from '@/lib/runtimeStore'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')?.toUpperCase()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    try {
        const skip = (page - 1) * limit

        const validCategories = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']

        if (!category || !validCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
        }

        const [rankings, total] = await Promise.all([
            prisma.playerRanking.findMany({
                where: { category },
                orderBy: { rank: 'asc' },
                skip,
                take: limit,
                include: {
                    player: {
                        select: { id: true, username: true, displayName: true, avatarUrl: true }
                    }
                }
            }),
            prisma.playerRanking.count({ where: { category } })
        ])

        const formatted = rankings.map(r => ({
            id: r.id,
            rank: r.rank,
            points: r.points,
            badges: JSON.parse(r.badges),
            category: r.category,
            player: r.player,
        }))

        return NextResponse.json({
            rankings: formatted,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('Players fetch error:', error)
        const fallback = runtimeGetCategoryRankings(category || '', page, limit)
        return NextResponse.json({
            rankings: fallback.rankings,
            total: fallback.total,
            page,
            totalPages: Math.ceil(fallback.total / limit),
            degraded: true,
        })
    }
}
