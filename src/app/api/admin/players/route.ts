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

// GET /api/admin/players - list all players with rankings
export async function GET(req: NextRequest) {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const players = await prisma.player.findMany({
        include: { rankings: { orderBy: { category: 'asc' } } },
        orderBy: { displayName: 'asc' }
    })

    return NextResponse.json({
        players: players.map(p => ({
            ...p,
            rankings: p.rankings.map(r => ({
                ...r,
                badges: JSON.parse(r.badges)
            }))
        }))
    })
}

// POST /api/admin/players - add a new player
export async function POST(req: NextRequest) {
    const admin = await getAdminUser(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { username, displayName, avatarUrl, category, rank, points, badges } = await req.json()

        if (!username || !displayName || !category || rank === undefined) {
            return NextResponse.json({ error: 'username, displayName, category, and rank are required' }, { status: 400 })
        }

        const validCategories = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']
        if (!validCategories.includes(category.toUpperCase())) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
        }

        // Check if rank is already taken in this category — shift others down
        await prisma.playerRanking.updateMany({
            where: { category: category.toUpperCase(), rank: { gte: rank } },
            data: { rank: { increment: 1 } }
        })

        let player = await prisma.player.findUnique({ where: { username } })
        if (!player) {
            player = await prisma.player.create({
                data: { username, displayName, avatarUrl: avatarUrl || '' }
            })
        }

        const existingRanking = await prisma.playerRanking.findFirst({
            where: { playerId: player.id, category: category.toUpperCase() }
        })

        if (existingRanking) {
            return NextResponse.json({ error: 'Player already ranked in this category' }, { status: 409 })
        }

        const ranking = await prisma.playerRanking.create({
            data: {
                playerId: player.id,
                category: category.toUpperCase(),
                rank: parseInt(rank),
                points: parseInt(points) || 0,
                badges: JSON.stringify(badges || []),
            },
            include: { player: true }
        })

        return NextResponse.json({
            success: true,
            ranking: { ...ranking, badges: JSON.parse(ranking.badges) }
        })
    } catch (error) {
        console.error('Add player error:', error)
        return NextResponse.json({ error: 'Failed to add player' }, { status: 500 })
    }
}
