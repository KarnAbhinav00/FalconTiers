'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const CATEGORIES = [
    { value: 'CPVP', label: 'CPVP', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png', desc: 'Crystal PvP' },
    { value: 'NETHPOT', label: 'NethPot', icon: '/modes/aaaaaaa.png', desc: 'Nether Potion' },
    { value: 'CRYSTAL', label: 'Crystal', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png', desc: 'Crystal PvP' },
    { value: 'UHC', label: 'UHC', icon: '/modes/iaaaaaaaaaamages.png', desc: 'Ultra Hardcore' },
    { value: 'SMP', label: 'SMP', icon: '/modes/iamages.png', desc: 'SMP PvP' },
    { value: 'POT', label: 'Pot', icon: '/modes/imaaaaaaaaaaaaages.png', desc: 'Potion PvP' },
    { value: 'AXE', label: 'Axe', icon: '/modes/imaaaaaaaaaaaages.png', desc: 'Axe PvP' },
    { value: 'SWORD', label: 'Sword', icon: '/modes/imaaages.png', desc: 'Sword PvP' },
    { value: 'MACE', label: 'Mace', icon: '/modes/imaaaages.png', desc: 'Mace PvP' },
    { value: 'DSMP', label: 'DSMP', icon: '/modes/diasmp-523efa38.png', desc: 'Dream SMP' },
    { value: 'CART', label: 'Cart', icon: '/modes/cart.png', desc: 'Cart PvP' },
    { value: 'SMPKIT', label: 'SMP Kit', icon: '/modes/iamages.png', desc: 'SMP Kit PvP' },
]

export default function ApplyPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ igName: '', category: '', experience: '', proofUrl: '' })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(d => {
                setUser(d.user)
                if (d.user?.igName) setForm(f => ({ ...f, igName: d.user.igName }))
                setLoading(false)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) { router.push('/login'); return }
        if (!form.category) { setError('Please select a category'); return }
        if (form.experience.length < 30) { setError('Please describe your experience in more detail (min. 30 characters)'); return }
        setSubmitting(true)
        setError('')
        try {
            const r = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const d = await r.json()
            if (!r.ok) { setError(d.error || 'Failed to submit'); setSubmitting(false); return }
            setSuccess(true)
        } catch { setError('Something went wrong') }
        setSubmitting(false)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* Hero */}
            <section style={{
                padding: 'clamp(40px, 6vw, 72px) 24px',
                textAlign: 'center',
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(180deg, rgba(6,182,212,0.05) 0%, transparent 100%)',
            }}>
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block', padding: '4px 14px',
                        background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
                        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px',
                    }}>Apply for Ranking</div>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginBottom: '12px' }}>
                        Get Ranked on Falcon Tiers
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
                        Think you have what it takes? Submit your application below and our admin team will review it. All applications are manually verified.
                    </p>
                </div>
            </section>

            <main style={{ flex: 1, maxWidth: '680px', margin: '0 auto', width: '100%', padding: '40px 24px' }}>

                {success ? (
                    <div className="glass-bright" style={{ padding: '48px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--green)' }}>Application Submitted!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                            Our admin team will review your application shortly. You can check the status in your{' '}
                            <Link href="/settings" style={{ color: 'var(--accent)' }}>account settings</Link>.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <Link href="/settings" className="btn btn-primary">View My Applications</Link>
                            <Link href="/" className="btn btn-outline">Back to Home</Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {!user && !loading && (
                            <div style={{ padding: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', textAlign: 'center' }}>
                                <p style={{ color: '#f59e0b', marginBottom: '12px', fontWeight: 600 }}>You need to be logged in to apply</p>
                                <Link href="/login" className="btn btn-primary">Login to Apply</Link>
                            </div>
                        )}

                        {/* IGN */}
                        <div className="glass-bright" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Info</h2>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>In-Game Name (IGN) *</label>
                            <input
                                className="input"
                                value={form.igName}
                                onChange={e => setForm(f => ({ ...f, igName: e.target.value }))}
                                placeholder="Your Minecraft username"
                                required
                            />
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Must match your exact in-game name
                            </p>
                        </div>

                        {/* Category */}
                        <div className="glass-bright" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Category *</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                                {CATEGORIES.map(cat => (
                                    <button
                                        type="button"
                                        key={cat.value}
                                        onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                                        style={{
                                            padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                            background: form.category === cat.value ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.03)',
                                            borderWidth: '1px', borderStyle: 'solid',
                                            borderColor: form.category === cat.value ? 'rgba(6,182,212,0.5)' : 'var(--border)',
                                            transition: 'all 0.2s', textAlign: 'center',
                                            fontFamily: 'var(--font)',
                                        }}
                                    >
                                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                            <img src={cat.icon} alt={cat.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: form.category === cat.value ? 'var(--accent)' : 'var(--text-primary)' }}>{cat.label}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="glass-bright" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Your Experience *
                            </h2>
                            <textarea
                                className="input"
                                value={form.experience}
                                onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                                placeholder="Describe your PvP experience, notable achievements, servers you've played on, estimated rank level, etc."
                                required
                                rows={6}
                                style={{ resize: 'vertical', minHeight: '120px', lineHeight: 1.6 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', color: form.experience.length < 30 ? 'var(--red)' : 'var(--text-muted)' }}>
                                    Min. 30 characters ({form.experience.length} typed)
                                </span>
                            </div>
                        </div>

                        {/* Proof */}
                        <div className="glass-bright" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Proof / Evidence <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                            </h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                Link to a video, screenshot, or any proof of your skill level
                            </p>
                            <input
                                className="input"
                                value={form.proofUrl}
                                onChange={e => setForm(f => ({ ...f, proofUrl: e.target.value }))}
                                placeholder="https://youtube.com/watch?v=... or https://imgur.com/..."
                                type="url"
                            />
                        </div>

                        {error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--red)' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || !user}
                            style={{ height: '48px', fontSize: '15px', fontWeight: 700, opacity: (submitting || !user) ? 0.6 : 1 }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                )}
            </main>

            <Footer />
        </div>
    )
}
