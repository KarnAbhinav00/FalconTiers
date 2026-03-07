'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', igName: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirm) { setError('Passwords do not match'); return }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
        setLoading(true)
        try {
            const r = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: form.username, email: form.email, igName: form.igName, password: form.password }),
            })
            const d = await r.json()
            if (!r.ok) { setError(d.error || 'Registration failed'); setLoading(false); return }
            router.push('/')
        } catch {
            setError('Something went wrong.')
            setLoading(false)
        }
    }

    const fields = [
        { key: 'username', label: 'Username', type: 'text', placeholder: 'Your account username', hint: 'Used to log in — cannot be changed later' },
        { key: 'igName', label: 'In-Game Name (IGN)', type: 'text', placeholder: 'Your Minecraft username', hint: 'The name you use in-game' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', hint: '' },
        { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters', hint: '' },
        { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', hint: '' },
    ]

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div className="glass-bright" style={{ padding: '36px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{
                                fontFamily: 'var(--font-display)', fontSize: '30px', letterSpacing: '4px',
                                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px',
                            }}>FALCON TIERS</div>
                            <h1 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '4px' }}>Create an account</h1>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Join the rankings community</p>
                        </div>

                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {fields.map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                                        {f.label}
                                        {f.key === 'igName' && (
                                            <span style={{ marginLeft: '6px', padding: '1px 6px', background: 'rgba(6,182,212,0.15)', color: 'var(--accent)', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                                                REQUIRED
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        className="input"
                                        type={f.type}
                                        value={(form as any)[f.key]}
                                        onChange={e => set(f.key, e.target.value)}
                                        placeholder={f.placeholder}
                                        required={f.key !== 'igName' ? true : false}
                                        autoFocus={f.key === 'username'}
                                    />
                                    {f.hint && (
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{f.hint}</div>
                                    )}
                                </div>
                            ))}

                            {error && (
                                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--red)' }}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={loading}
                                style={{ width: '100%', height: '44px', fontSize: '15px', fontWeight: 700, marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        <div className="divider" />

                        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
                        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to home</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}
