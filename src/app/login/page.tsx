'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function LoginContent() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const from = searchParams.get('from')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const r = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
            const d = await r.json()
            if (!r.ok) {
                setError(d.error || 'Login failed')
                setLoading(false)
                return
            }
            // Force full navigation so auth cookie is committed before protected-route checks run.
            if (d.user?.role === 'ADMIN' || from === 'admin') window.location.assign('/admin')
            else window.location.assign('/')
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div className="glass-bright" style={{ padding: '36px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '32px',
                                letterSpacing: '4px',
                                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '6px',
                            }}>
                                FALCON TIERS
                            </div>
                            <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Welcome back</h1>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                {from === 'admin' ? 'Admin access required' : 'Sign in to your account'}
                            </p>
                        </div>

                        {from === 'admin' && (
                            <div style={{
                                padding: '10px 14px',
                                background: 'rgba(245,158,11,0.1)',
                                border: '1px solid rgba(245,158,11,0.3)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#f59e0b',
                                marginBottom: '20px',
                                textAlign: 'center',
                            }}>
                                <i className="fa-solid fa-lock" style={{ marginRight: '8px' }}></i>
                                Admin credentials required
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Username
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Password
                                </label>
                                <input
                                    className="input"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            {error && (
                                <div style={{
                                    padding: '10px 14px',
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: 'var(--red)',
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    marginTop: '4px',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <div className="divider" />

                        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                            Don&apos;t have an account?{' '}
                            <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                                Register
                            </Link>
                        </p>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                            <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
                            Back to rankings
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" />
                </main>
                <Footer />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
