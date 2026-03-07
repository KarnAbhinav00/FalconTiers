import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenPayloadFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

async function getUser(req: NextRequest) {
    return getTokenPayloadFromRequest(req)
}

// POST: submit application
export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(req, 'apply:create', 8, 60_000)
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many submissions. Please wait and try again.' },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
            )
        }

        const user = await getUser(req)
        if (!user) return NextResponse.json({ error: 'Must be logged in to apply' }, { status: 401 })

        const { igName, category, experience, proofUrl } = await req.json()

        if (!igName || !category || !experience) {
            return NextResponse.json({ error: 'IGN, category, and experience are required' }, { status: 400 })
        }

        const validCategories = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']
        if (!validCategories.includes(category.toUpperCase())) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
        }

        // Check if already has a pending application for this category
        const existing = await prisma.application.findFirst({
            where: {
                userId: user.userId as number,
                category: category.toUpperCase(),
                status: 'PENDING'
            }
        })
        if (existing) {
            return NextResponse.json({ error: 'You already have a pending application for this category' }, { status: 409 })
        }

        const application = await prisma.application.create({
            data: {
                userId: user.userId as number,
                igName,
                category: category.toUpperCase(),
                experience,
                proofUrl: proofUrl || '',
                status: 'PENDING',
            }
        })

        return NextResponse.json({ success: true, application })
    } catch (error) {
        console.error('Apply error:', error)
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }
}

// GET: get current user's applications
export async function GET(req: NextRequest) {
    try {
        const user = await getUser(req)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const applications = await prisma.application.findMany({
            where: { userId: user.userId as number },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ applications })
    } catch (error) {
        console.error('Get applications error:', error)
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }
}
