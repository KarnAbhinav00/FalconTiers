'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface UserProfile {
    id: number
    username: string
    email: string
    igName: string
    displayName: string
    avatarUrl: string
    bio: string
    role: string
    createdAt: string
}

function AvatarInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Preview */}
            <div style={{
                width: '100px', height: '100px', borderRadius: '16px',
                border: '2px solid var(--border-bright)',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', fontWeight: 700, color: '#fff',
                position: 'relative',
            }}>
                {value ? (
                    <img src={value} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : '?'}
            </div>
            <div style={{ width: '100%' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Avatar URL
                </label>
                <input
                    className="input"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="https://i.imgur.com/abc123.png"
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Paste a direct image URL (imgur, discord CDN, etc.)
                </p>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ displayName: '', igName: '', bio: '', avatarUrl: '' })
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
    const [activeTab, setActiveTab] = useState<'profile' | 'applications'>('profile')
    const [applications, setApplications] = useState<any[]>([])
    const router = useRouter()

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(d => {
                if (!d.user) { router.push('/login'); return }
                setUser(d.user)
                setForm({
                    displayName: d.user.displayName || d.user.username,
                    igName: d.user.igName || '',
                    bio: d.user.bio || '',
                    avatarUrl: d.user.avatarUrl || '',
                })
                setLoading(false)
            })
    }, [router])

    useEffect(() => {
        if (activeTab === 'applications') {
            fetch('/api/apply')
                .then(r => r.json())
                .then(d => setApplications(d.applications || []))
        }
    }, [activeTab])

    const handleSave = async () => {
        setSaving(true)
        try {
            const r = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const d = await r.json()
            if (!r.ok) { showToast(d.error || 'Failed to save', 'error') }
            else {
                setUser(d.user)
                showToast('Profile updated!', 'success')
            }
        } catch { showToast('Error saving profile', 'error') }
        setSaving(false)
    }

    const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
        PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Pending' },
        APPROVED: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'Approved' },
        REJECTED: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Rejected' },
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" />
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
                </div>
            )}

            <main style={{ flex: 1, maxWidth: '760px', margin: '0 auto', width: '100%', padding: '40px 24px' }}>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>⚙️</span> Account Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Manage your profile for <strong style={{ color: 'var(--text-secondary)' }}>@{user?.username}</strong>
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    {[
                        { id: 'profile', label: '👤 Profile' },
                        { id: 'applications', label: '📋 My Applications' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                flex: 1, padding: '8px 16px', borderRadius: '7px',
                                border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font)', fontSize: '13px', fontWeight: 600,
                                background: activeTab === tab.id ? 'rgba(6,182,212,0.12)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Avatar card */}
                        <div className="glass-bright" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
                                Profile Photo
                            </h2>
                            <AvatarInput value={form.avatarUrl} onChange={v => setForm(f => ({ ...f, avatarUrl: v }))} />
                        </div>

                        {/* Info card */}
                        <div className="glass-bright" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
                                Profile Info
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Username — read only */}
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Username <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— cannot be changed</span>
                                    </label>
                                    <div style={{
                                        padding: '10px 14px', borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--border)',
                                        fontSize: '14px', color: 'var(--text-muted)',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}>
                                        <span style={{ color: 'var(--text-muted)' }}>@</span>
                                        {user?.username}
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Display Name
                                    </label>
                                    <input
                                        className="input"
                                        value={form.displayName}
                                        onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                                        placeholder="How your name appears on the site"
                                        maxLength={32}
                                    />
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Shown on leaderboards and your profile ({form.displayName.length}/32)
                                    </div>
                                </div>

                                {/* IGN */}
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        In-Game Name (IGN)
                                    </label>
                                    <input
                                        className="input"
                                        value={form.igName}
                                        onChange={e => setForm(f => ({ ...f, igName: e.target.value }))}
                                        placeholder="Your Minecraft username"
                                    />
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Your actual Minecraft in-game name
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Bio
                                    </label>
                                    <textarea
                                        className="input"
                                        value={form.bio}
                                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                        placeholder="Tell the community about yourself..."
                                        maxLength={200}
                                        rows={3}
                                        style={{ resize: 'vertical', minHeight: '80px', lineHeight: 1.5 }}
                                    />
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {form.bio.length}/200 characters
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email card */}
                        <div className="glass-bright" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                                Account Info
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '10px 0' }}>{user?.email}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '10px 0', textTransform: 'capitalize' }}>
                                        {user?.role === 'ADMIN' ? '⚡ Admin' : '🎮 Player'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</label>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '10px 0' }}>
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                disabled={saving}
                                style={{ minWidth: '140px', opacity: saving ? 0.7 : 1 }}
                            >
                                {saving ? 'Saving...' : '✓ Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>My Applications</h2>
                            <Link href="/apply" className="btn btn-primary btn-sm">+ New Application</Link>
                        </div>

                        {applications.length === 0 ? (
                            <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                                <div style={{ fontWeight: 700, marginBottom: '6px' }}>No applications yet</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                                    Apply to get ranked in a category
                                </div>
                                <Link href="/apply" className="btn btn-primary">Apply Now</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {applications.map((app: any) => {
                                    const s = STATUS_STYLES[app.status] || STATUS_STYLES.PENDING
                                    return (
                                        <div key={app.id} className="glass" style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                                <div>
                                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{app.category}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>— {app.igName}</span>
                                                </div>
                                                <span style={{ padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '100px', fontSize: '12px', fontWeight: 700 }}>
                                                    {s.label}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: app.adminNote ? '8px' : 0 }}>
                                                {app.experience}
                                            </p>
                                            {app.adminNote && (
                                                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)', borderLeft: '2px solid var(--border-bright)' }}>
                                                    Admin note: {app.adminNote}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                                Submitted {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
