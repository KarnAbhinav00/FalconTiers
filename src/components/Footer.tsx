import Link from 'next/link'

export default function Footer() {
    const categories = [
        { href: '/rankings/cpvp', label: 'CPVP Rankings' },
        { href: '/rankings/nethpot', label: 'NethPot Rankings' },
        { href: '/rankings/smpkit', label: 'SMP Kit Rankings' },
    ]

    return (
        <footer style={{
            borderTop: '1px solid var(--border)',
            background: 'rgba(8,8,16,0.95)',
            marginTop: 'auto',
        }}>
            {/* Main footer content */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 24px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '32px',
            }}>
                {/* Brand */}
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '28px',
                        letterSpacing: '4px',
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px',
                    }}>
                        FALCON TIERS
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        The #1 competitive PvP ranking platform. Track, compete, and rise through the tiers.
                    </p>
                </div>

                {/* Rankings */}
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Rankings
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {categories.map(c => (
                            <Link key={c.href} href={c.href} style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            >
                                {c.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Account */}
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Account
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[{ href: '/login', label: 'Login' }, { href: '/register', label: 'Register' }].map(l => (
                            <Link key={l.href} href={l.href} style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Badge guide */}
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Tier Badges
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {['HT1', 'HT2', 'HT3', 'HT4', 'HT5'].map(b => (
                            <span key={b} className={`badge badge-${b}`}>{b}</span>
                        ))}
                        {['LT1', 'LT2'].map(b => (
                            <span key={b} className={`badge badge-${b}`}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{
                borderTop: '1px solid var(--border)',
                padding: '16px 24px',
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
            }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    © 2026 Falcon Tiers. All rights reserved.
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Made by</span>
                        <a
                            href="https://abhinav.ice.lol"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--accent)',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Tyson
                        </a>
                    </div>
                    <span style={{ color: 'var(--border)' }}>|</span>
                    <a
                        href="https://github.com/KarnAbhinav00"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                        <i className="fa-brands fa-github"></i> GitHub
                    </a>
                </div>
            </div>
        </footer>
    )
}
