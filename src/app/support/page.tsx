'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const FAQS = [
    { q: 'How do I get ranked on the leaderboard?', a: 'Go to the Apply page, fill in your in-game name, select a category, describe your experience, and optionally add proof. Our admins review every application manually.' },
    { q: 'How long does it take to get reviewed?', a: 'Most applications are reviewed within 24–48 hours. You will be able to see the status in your Account Settings → My Applications.' },
    { q: 'What do the HT/LT badges mean?', a: 'HT stands for High Tier (HT1 being the highest), and LT stands for Low Tier (LT5 being the lowest). They represent your overall skill level in that category.' },
    { q: 'Can I have a different rank in each category?', a: 'Yes! Your rank and badges are independent per category. You can be HT1 in CPVP and LT2 in NethPot simultaneously.' },
    { q: 'My in-game name changed. How do I update it?', a: 'Go to Settings and update your IGN there. Note that your ranking profile needs to be updated by an admin to reflect the new name.' },
    { q: 'How do I appeal a ban or ranking decision?', a: 'Send a detailed message to our Discord server. Provide your username and the reason for your appeal.' },
]

export default function SupportPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* Hero */}
            <section style={{
                padding: 'clamp(40px, 6vw, 72px) 24px',
                textAlign: 'center',
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
            }}>
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>💬</div>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, marginBottom: '12px' }}>Support Center</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
                        Got questions? We&apos;ve got answers. Browse the FAQ below or reach out to our team.
                    </p>
                </div>
            </section>

            <main style={{ flex: 1, maxWidth: '760px', margin: '0 auto', width: '100%', padding: '48px 24px' }}>

                {/* Quick links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '48px' }}>
                    {[
                        { icon: '🚀', label: 'Apply for Ranking', href: '/apply', desc: 'Submit your application' },
                        { icon: '⚙️', label: 'Account Settings', href: '/settings', desc: 'Edit your profile' },
                        { icon: '🏆', label: 'View Rankings', href: '/rankings/cpvp', desc: 'See the leaderboards' },
                    ].map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="glass"
                            style={{
                                padding: '20px', textDecoration: 'none', borderRadius: '12px',
                                transition: 'transform 0.2s, box-shadow 0.2s', display: 'block',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '' }}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>{item.label}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                        </Link>
                    ))}
                </div>

                {/* FAQ */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>❓</span> Frequently Asked Questions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {FAQS.map((faq, i) => (
                            <FaqItem key={i} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="glass" style={{ padding: '28px', marginTop: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎮</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Still need help?</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
                        Join our community Discord for fastest support from the admin team
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.3)', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#818cf8' }}>
                        🔌 Discord server coming soon
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div
            className="glass"
            style={{ overflow: 'hidden', transition: 'box-shadow 0.2s' }}
        >
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: '12px', fontFamily: 'var(--font)',
                    textAlign: 'left',
                }}
            >
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{q}</span>
                <span style={{
                    fontSize: '18px', color: 'var(--text-muted)', transition: 'transform 0.2s',
                    transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0,
                }}>+</span>
            </button>
            {open && (
                <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, paddingTop: '12px' }}>{a}</p>
                </div>
            )}
        </div>
    )
}

// Need to import useState inside the file
import { useState } from 'react'
