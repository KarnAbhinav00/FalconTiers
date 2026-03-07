'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

interface User {
    id: number
    username: string
    role: string
    displayName: string
    avatarUrl: string
}

const CATEGORY_ITEMS = [
    { href: '/rankings/cpvp', label: 'CPVP', desc: 'Crystal PvP', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png' },
    { href: '/rankings/nethpot', label: 'NethPot', desc: 'Nether Potion PvP', icon: '/modes/aaaaaaa.png' },
    { href: '/rankings/crystal', label: 'Crystal', desc: 'Crystal PvP', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png' },
    { href: '/rankings/uhc', label: 'UHC', desc: 'Ultra Hardcore', icon: '/modes/iaaaaaaaaaamages.png' },
    { href: '/rankings/smp', label: 'SMP', desc: 'SMP PvP', icon: '/modes/iamages.png' },
    { href: '/rankings/pot', label: 'Pot', desc: 'Potion PvP', icon: '/modes/imaaaaaaaaaaaaages.png' },
    { href: '/rankings/axe', label: 'Axe', desc: 'Axe PvP', icon: '/modes/imaaaaaaaaaaaages.png' },
    { href: '/rankings/sword', label: 'Sword', desc: 'Sword PvP', icon: '/modes/imaaages.png' },
    { href: '/rankings/mace', label: 'Mace', desc: 'Mace PvP', icon: '/modes/imaaaages.png' },
    { href: '/rankings/dsmp', label: 'DSMP', desc: 'Dream SMP', icon: '/modes/diasmp-523efa38.png' },
    { href: '/rankings/cart', label: 'Cart', desc: 'Cart PvP', icon: '/modes/cart.png' },
    { href: '/rankings/smpkit', label: 'SMP Kit', desc: 'SMP Kit PvP', icon: '/modes/iamages.png' },
]

const NAV_ITEMS = [
    { href: '/', label: 'Home', hasDropdown: false },
    { href: '/apply', label: 'Apply', hasDropdown: false },
    { href: '/support', label: 'Support', hasDropdown: false },
    {
        href: '#',
        label: 'Tier List',
        hasDropdown: true,
        dropdown: CATEGORY_ITEMS,
    },
]

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(d => setUser(d.user || null))
            .catch((e) => console.error(e))
    }, [pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setActiveDropdown(null)
            }
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setUser(null)
        router.push('/')
        setMenuOpen(false)
    }

    const openDropdown = (label: string) => {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setActiveDropdown(label)
    }
    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setActiveDropdown(null), 150)
    }

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href)

    return (
        <nav
            ref={dropdownRef}
            style={{
                position: 'sticky', top: 0, zIndex: 200,
                background: scrolled ? 'rgba(8,8,16,0.96)' : 'rgba(8,8,16,0.80)',
                backdropFilter: 'blur(24px)',
                borderBottom: scrolled ? '1px solid var(--border-bright)' : '1px solid var(--border)',
                transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
            }}
        >
            <div style={{
                maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', height: '62px',
            }}>

                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '24px', letterSpacing: '3px',
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>FALCON</span>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '24px', letterSpacing: '3px', color: 'var(--text-secondary)',
                    }}>TIERS</span>
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="desktop-nav">
                    {NAV_ITEMS.map(item => (
                        <div key={item.label} style={{ position: 'relative' }}>
                            {item.hasDropdown ? (
                                <button
                                    onMouseEnter={() => openDropdown(item.label)}
                                    onMouseLeave={scheduleClose}
                                    style={{
                                        background: pathname.startsWith('/rankings') ? 'rgba(6,182,212,0.08)' : 'transparent',
                                        border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        padding: '7px 14px', borderRadius: '8px',
                                        fontSize: '14px', fontWeight: 600,
                                        fontFamily: 'var(--font)',
                                        color: pathname.startsWith('/rankings') ? 'var(--accent)' : 'var(--text-secondary)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {item.label}
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                                        style={{ transition: 'transform 0.2s', transform: activeDropdown === item.label ? 'rotate(180deg)' : 'none' }}>
                                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                    </svg>
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        padding: '7px 14px', borderRadius: '8px',
                                        fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                                        color: isActive(item.href) ? 'var(--accent)' : 'var(--text-secondary)',
                                        background: isActive(item.href) ? 'rgba(6,182,212,0.08)' : 'transparent',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {item.label}
                                </Link>
                            )}

                            {/* Dropdown */}
                            {item.hasDropdown && item.dropdown && activeDropdown === item.label && (
                                <div
                                    onMouseEnter={() => openDropdown(item.label)}
                                    onMouseLeave={scheduleClose}
                                    style={{
                                        position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'rgba(13,13,26,0.98)',
                                        backdropFilter: 'blur(24px)',
                                        border: '1px solid var(--border-bright)',
                                        borderRadius: '14px',
                                        padding: '8px',
                                        minWidth: '340px',
                                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                                        gap: '4px',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1)',
                                        animation: 'fadeIn 0.15s ease',
                                        zIndex: 300,
                                    }}
                                >
                                    {item.dropdown.map(d => (
                                        <Link
                                            key={d.href}
                                            href={d.href}
                                            onClick={() => setActiveDropdown(null)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 12px', borderRadius: '10px',
                                                textDecoration: 'none',
                                                background: pathname === d.href ? 'rgba(6,182,212,0.1)' : 'transparent',
                                                border: pathname === d.href ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)' }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = pathname === d.href ? 'rgba(6,182,212,0.1)' : 'transparent' }}
                                        >
                                            <span style={{ width: '28px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                                                <img src={d.icon} alt={d.label} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                            </span>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: pathname === d.href ? 'var(--accent)' : 'var(--text-primary)' }}>{d.label}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{d.desc}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {user?.role === 'ADMIN' && (
                        <Link
                            href="/admin"
                            style={{
                                padding: '7px 14px', borderRadius: '8px',
                                fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                                color: pathname.startsWith('/admin') ? '#f59e0b' : 'var(--text-muted)',
                                background: pathname.startsWith('/admin') ? 'rgba(245,158,11,0.1)' : 'transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            Admin
                        </Link>
                    )}
                </div>

                {/* Auth area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link href="/settings" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '14px', color: '#fff', flexShrink: 0,
                                    border: '1px solid var(--border-bright)',
                                }}>
                                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.displayName || user.username)[0].toUpperCase()}
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }} className="desktop-nav">
                                    {user.displayName || user.username}
                                </span>
                            </Link>
                            <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-outline btn-sm">Login</Link>
                            <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
                        </>
                    )}

                    {/* Hamburger */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="mobile-menu-btn"
                        style={{
                            display: 'none', background: 'none',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)', borderRadius: '6px',
                            padding: '6px 10px', cursor: 'pointer', fontSize: '16px',
                        }}
                    >
                        {menuOpen ? 'X' : 'Menu'}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div style={{
                    padding: '8px 16px 16px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    background: 'rgba(8,8,16,0.99)',
                    animation: 'fadeIn 0.2s ease',
                }}>
                    {NAV_ITEMS.map(item => (
                        item.hasDropdown ? (
                            <div key={item.label}>
                                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Tier List
                                </div>
                                {item.dropdown?.map(d => (
                                    <Link
                                        key={d.href}
                                        href={d.href}
                                        onClick={() => setMenuOpen(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '10px 12px', borderRadius: '8px',
                                            fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                                            color: pathname === d.href ? 'var(--accent)' : 'var(--text-secondary)',
                                        }}
                                    >
                                        <img src={d.icon} alt={d.label} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> {d.label}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    padding: '10px 12px', borderRadius: '8px',
                                    fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                                    color: isActive(item.href) ? 'var(--accent)' : 'var(--text-secondary)',
                                    background: isActive(item.href) ? 'rgba(6,182,212,0.08)' : 'transparent',
                                }}
                            >
                                {item.label}
                            </Link>
                        )
                    ))}
                    {user?.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', color: '#f59e0b' }}>
                            Admin Panel
                        </Link>
                    )}
                    <div className="divider" style={{ margin: '8px 0' }} />
                    {user ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href="/settings" onClick={() => setMenuOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Settings</Link>
                            <button onClick={logout} className="btn btn-danger" style={{ flex: 1 }}>Logout</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Login</Link>
                            <Link href="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>Register</Link>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </nav>
    )
}
