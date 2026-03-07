import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'falcon-tiers-secret-2024')
const CATEGORIES = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    payload = verified.payload
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
    const categories: Record<string, number> = {}
    for (const key of CATEGORIES) categories[key] = 0
    return NextResponse.json({ totalPlayers: 0, categories, degraded: true })
  }
}
