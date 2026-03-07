import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'
import { runtimeAddPlayerRanking, runtimeGetPlayersWithRankings } from '@/lib/runtimeStore'

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

export async function GET(req: NextRequest) {
  const admin = await getAdminUser(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const players = await prisma.player.findMany({
      include: { rankings: { orderBy: { category: 'asc' } } },
      orderBy: { displayName: 'asc' },
    })

    return NextResponse.json({
      players: players.map((p) => ({
        ...p,
        rankings: p.rankings.map((r) => ({ ...r, badges: JSON.parse(r.badges) })),
      })),
    })
  } catch (error) {
    console.error('Admin players GET fallback:', error)
    return NextResponse.json({ players: runtimeGetPlayersWithRankings(), degraded: true })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { username, displayName, avatarUrl, category, rank, points, badges } = body

  if (!username || !displayName || !category || rank === undefined) {
    return NextResponse.json({ error: 'username, displayName, category, and rank are required' }, { status: 400 })
  }

  const validCategories = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']
  if (!validCategories.includes(String(category).toUpperCase())) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  try {
    await prisma.playerRanking.updateMany({
      where: { category: String(category).toUpperCase(), rank: { gte: Number(rank) } },
      data: { rank: { increment: 1 } },
    })

    let player = await prisma.player.findUnique({ where: { username: String(username) } })
    if (!player) {
      player = await prisma.player.create({
        data: { username: String(username), displayName: String(displayName), avatarUrl: avatarUrl || '' },
      })
    }

    const existingRanking = await prisma.playerRanking.findFirst({
      where: { playerId: player.id, category: String(category).toUpperCase() },
    })
    if (existingRanking) {
      return NextResponse.json({ error: 'Player already ranked in this category' }, { status: 409 })
    }

    const ranking = await prisma.playerRanking.create({
      data: {
        playerId: player.id,
        category: String(category).toUpperCase(),
        rank: Number(rank),
        points: Number(points) || 0,
        badges: JSON.stringify(badges || []),
      },
      include: { player: true },
    })

    return NextResponse.json({ success: true, ranking: { ...ranking, badges: JSON.parse(ranking.badges) } })
  } catch (error) {
    console.error('Add player fallback:', error)
    const fallback = runtimeAddPlayerRanking({
      username: String(username),
      displayName: String(displayName),
      avatarUrl,
      category: String(category),
      rank: Number(rank),
      points: Number(points) || 0,
      badges: badges || [],
    })
    if ('error' in fallback) return NextResponse.json({ error: fallback.error }, { status: 409 })
    return NextResponse.json({
      success: true,
      ranking: { ...fallback.ranking, player: fallback.player, degraded: true },
    })
  }
}
