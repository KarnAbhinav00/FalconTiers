import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearAuthCookie, getTokenPayloadFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const payload = await getTokenPayloadFromRequest(req)
        if (!payload) return NextResponse.json({ user: null })
        const userId = payload.userId as number
        let user = null
        try {
            user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, username: true, email: true, role: true,
                    igName: true, displayName: true, avatarUrl: true, bio: true,
                    isBanned: true, createdAt: true,
                }
            })
        } catch (dbError) {
            console.error('Auth me DB error:', dbError)
        }

        if (!user && payload.role === 'ADMIN') {
            return NextResponse.json({
                user: {
                    id: userId || 0,
                    username: String(payload.username || process.env.ADMIN_USERNAME || 'admin'),
                    email: 'admin@local',
                    role: 'ADMIN',
                    igName: '',
                    displayName: 'Admin',
                    avatarUrl: '',
                    bio: '',
                    isBanned: false,
                    createdAt: new Date(0).toISOString(),
                },
                player: null,
            })
        }

        if (!user) return NextResponse.json({ user: null })
        if (user.isBanned) {
            const response = NextResponse.json({ user: null, banned: true })
            clearAuthCookie(response)
            return response
        }
        let player = null
        try {
            player = await prisma.player.findFirst({
                where: { userId },
                include: { rankings: true }
            })
        } catch (dbError) {
            console.error('Auth me player fetch error:', dbError)
        }

        return NextResponse.json({ user, player })
    } catch {
        return NextResponse.json({ user: null })
    }
}

// PATCH: update user profile
export async function PATCH(req: NextRequest) {
    try {
        const payload = await getTokenPayloadFromRequest(req)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const userId = payload.userId as number

        const { displayName, avatarUrl, bio, igName } = await req.json()

        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(displayName !== undefined && { displayName }),
                ...(avatarUrl !== undefined && { avatarUrl }),
                ...(bio !== undefined && { bio }),
                ...(igName !== undefined && { igName }),
            },
            select: {
                id: true, username: true, email: true, role: true,
                igName: true, displayName: true, avatarUrl: true, bio: true,
            }
        })

        // Sync displayName to player profile if it exists
        if (displayName) {
            await prisma.player.updateMany({
                where: { userId },
                data: { displayName, avatarUrl: avatarUrl || undefined }
            })
        }

        return NextResponse.json({ success: true, user: updated })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
