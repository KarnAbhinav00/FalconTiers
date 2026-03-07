import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runtimeCategoryCounts } from '@/lib/runtimeStore'
import { getAdminPayloadFromRequest } from '@/lib/auth'

const CATEGORIES = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']

export async function GET(req: NextRequest) {
  const payload = await getAdminPayloadFromRequest(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [totalPlayers, grouped] = await Promise.all([
      prisma.player.count(),
      prisma.playerRanking.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
    ])

    const categories: Record<string, number> = {}
    for (const key of CATEGORIES) categories[key] = 0
    for (const row of grouped) categories[row.category] = row._count.category

    return NextResponse.json({ totalPlayers, categories })
  } catch (error) {
    console.error('Admin stats DB error:', error)
    const fallback = runtimeCategoryCounts(CATEGORIES)
    return NextResponse.json({ ...fallback, degraded: true })
  }
}
