import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  runtimeAddPlayerRanking,
  runtimeDeleteRanking,
  runtimeGetPlayersWithRankings,
  runtimeUpdateRanking,
} from '@/lib/runtimeStore'
import { getAdminPayloadFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const admin = await getAdminPayloadFromRequest(req)
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
  const rl = rateLimit(req, 'admin:players:create', 60, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  const admin = await getAdminPayloadFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { username, displayName, avatarUrl, category, rank, points, badges } = body

  if (!username || !displayName || !category || rank === undefined) {
    return NextResponse.json({ error: 'username, displayName, category, and rank are required' }, { status: 400 })
  }

  const validCategories = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']
  const normalizedCategory = String(category).toUpperCase()
  if (!validCategories.includes(normalizedCategory)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }
  const requestedRank = Number(rank)
  if (!Number.isFinite(requestedRank) || requestedRank < 1) {
    return NextResponse.json({ error: 'rank must be a positive number' }, { status: 400 })
  }

  try {
    let player = await prisma.player.findUnique({ where: { username: String(username) } })
    if (!player) {
      player = await prisma.player.create({
        data: { username: String(username), displayName: String(displayName), avatarUrl: avatarUrl || '' },
      })
    }

    const existingRanking = await prisma.playerRanking.findFirst({
      where: { playerId: player.id, category: normalizedCategory },
    })
    if (existingRanking) {
      return NextResponse.json({ error: 'Player already ranked in this category' }, { status: 409 })
    }

    const categoryCount = await prisma.playerRanking.count({ where: { category: normalizedCategory } })
    const insertRank = Math.min(Math.max(Math.floor(requestedRank), 1), categoryCount + 1)

    await prisma.playerRanking.updateMany({
      where: { category: normalizedCategory, rank: { gte: insertRank } },
      data: { rank: { increment: 1 } },
    })

    const ranking = await prisma.playerRanking.create({
      data: {
        playerId: player.id,
        category: normalizedCategory,
        rank: insertRank,
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

export async function PUT(req: NextRequest) {
  const rl = rateLimit(req, 'admin:players:update', 90, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  const admin = await getAdminPayloadFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, rank, points, badges, displayName, avatarUrl } = body
  const rankingId = Number(id)
  if (!rankingId) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    const ranking = await prisma.playerRanking.findUnique({
      where: { id: rankingId },
      include: { player: true },
    })
    if (!ranking) return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })

    if (displayName || avatarUrl !== undefined) {
      await prisma.player.update({
        where: { id: ranking.playerId },
        data: {
          ...(displayName && { displayName: String(displayName) }),
          ...(avatarUrl !== undefined && { avatarUrl: String(avatarUrl) }),
        },
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
          include: { player: true },
        })
      } else {
        updated = await tx.playerRanking.update({
          where: { id: rankingId },
          data: {
            ...(points !== undefined && { points: Number(points) }),
            ...(badges !== undefined && { badges: JSON.stringify(badges) }),
          },
          include: { player: true },
        })
      }
    })

    return NextResponse.json({
      success: true,
      ranking: { ...updated!, badges: JSON.parse(updated!.badges) },
    })
  } catch (error) {
    console.error('Update player fallback:', error)
    const fallback = runtimeUpdateRanking(rankingId, {
      rank: rank !== undefined ? Number(rank) : undefined,
      points: points !== undefined ? Number(points) : undefined,
      badges: badges !== undefined ? badges : undefined,
      displayName: displayName !== undefined ? String(displayName) : undefined,
      avatarUrl: avatarUrl !== undefined ? String(avatarUrl) : undefined,
    })
    if (!fallback) return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })
    return NextResponse.json({
      success: true,
      ranking: { ...fallback.ranking, player: fallback.player, degraded: true },
    })
  }
}

export async function DELETE(req: NextRequest) {
  const rl = rateLimit(req, 'admin:players:delete', 60, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  const admin = await getAdminPayloadFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const rankingId = Number(body?.id)
  if (!rankingId) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
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
    console.error('Delete player fallback:', error)
    const ok = runtimeDeleteRanking(rankingId)
    if (!ok) return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })
    return NextResponse.json({ success: true, degraded: true })
  }
}
