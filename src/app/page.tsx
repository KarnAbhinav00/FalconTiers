'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BADGE_COLORS: Record<string, string> = {
  HT1: '#fbbf24', HT2: '#f97316', HT3: '#a855f7',
  HT4: '#3b82f6', HT5: '#06b6d4',
  LT1: '#64748b', LT2: '#475569',
}

interface TopPlayer {
  rank: number
  player: { username: string; displayName: string }
  points: number
  badges: string[]
}

interface CategoryData {
  label: string
  key: string
  href: string
  color: string
  icon: string
  description: string
  topPlayers: TopPlayer[]
  total: number
}

function BadgePill({ badge }: { badge: string }) {
  return (
    <span className={`badge badge-${badge}`}>{badge}</span>
  )
}

function CategoryCard({ cat, index }: { cat: CategoryData; index: number }) {
  return (
    <div
      className="glass"
      style={{
        padding: '0',
        overflow: 'hidden',
        animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
          ; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${cat.color}30`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = ''
          ; (e.currentTarget as HTMLDivElement).style.boxShadow = ''
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--border)',
        background: `linear-gradient(135deg, ${cat.color}12 0%, transparent 100%)`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <img src={cat.icon} alt={cat.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '2px',
            color: cat.color,
          }}>
            {cat.label}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {cat.total} ranked players
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {cat.description}
        </p>
      </div>

      {/* Top players */}
      <div style={{ padding: '4px 0' }}>
        {cat.topPlayers.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 24px',
            borderBottom: i < cat.topPlayers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            <div style={{
              width: '28px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '14px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px',
              color: i === 0 ? '#fbbf24' : i === 1 ? '#e2e8f0' : '#f97316',
              flexShrink: 0,
            }}>
              {i === 0 ? <i className="fa-solid fa-trophy" style={{ fontSize: '16px' }}></i> : `#${p.rank}`}
            </div>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: `linear-gradient(135deg, ${cat.color} 0%, #8b5cf6 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              color: '#fff',
              flexShrink: 0,
            }}>
              {p.player.displayName[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.player.displayName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {p.points.toLocaleString()} pts
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {p.badges.slice(0, 2).map(b => (
                <BadgePill key={b} badge={b} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <Link
          href={cat.href}
          className="btn btn-outline"
          style={{ width: '100%', borderColor: `${cat.color}44`, color: cat.color }}
        >
          View Full Rankings {'->'}
        </Link>
      </div>
    </div>
  )
}

function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TopPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const r = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`)
      const d = await r.json()
      setResults(d.results || [])
    } catch { }
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  return (
    <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true) }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search for a player..."
          style={{
            paddingLeft: '42px',
            paddingRight: '16px',
            height: '48px',
            fontSize: '15px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-bright)',
          }}
        />
        <span style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '18px',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}>Search</span>
        {loading && (
          <span style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '12px',
          }}>...</span>
        )}
      </div>

      {showResults && (results.length > 0 || (query.length >= 2 && !loading)) && (
        <div className="glass-bright" style={{
          position: 'absolute',
          top: '52px',
          left: 0,
          right: 0,
          zIndex: 50,
          overflow: 'hidden',
          maxHeight: '360px',
          overflowY: 'auto',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No players found for &ldquo;{query}&rdquo;
            </div>
          ) : results.map((r: any) => (
            <div
              key={r.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                  {r.displayName[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.displayName}</div>
                  {r.rankings?.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {r.rankings.map((rank: any) => (
                        <Link
                          key={rank.category}
                          href={`/rankings/${rank.category.toLowerCase()}`}
                          style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {rank.category} #{rank.rank}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {r.rankings?.flatMap((rank: any) => rank.badges).slice(0, 3).map((b: string, i: number) => (
                    <BadgePill key={i} badge={b} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [stats, setStats] = useState({ total: 0 })

  const handleLoadingDone = useCallback(() => {
    setLoaded(true)
    setTimeout(() => setShowContent(true), 50)
  }, [])

  useEffect(() => {
    if (!loaded) return
    const catDefs = [
      { key: 'CPVP', label: 'CPVP', href: '/rankings/cpvp', color: '#06b6d4', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png', description: 'Crystal PvP rankings for advanced end-crystal combat players.' },
      { key: 'NETHPOT', label: 'NethPot', href: '/rankings/nethpot', color: '#f97316', icon: '/modes/aaaaaaa.png', description: 'Nether potion combat rankings focused on speed, aim, and consistency.' },
      { key: 'SMPKIT', label: 'SMP Kit', href: '/rankings/smpkit', color: '#22c55e', icon: '/modes/iamages.png', description: 'SMP kit PvP rankings based on gear management and duel performance.' },
    ]

    Promise.all(
      catDefs.map(async cat => {
        const r = await fetch(`/api/players?category=${cat.key}&limit=3`)
        const d = await r.json()
        return {
          ...cat,
          topPlayers: d.rankings || [],
          total: d.total || 0,
        }
      })
    ).then(cats => {
      setCategories(cats)
      setStats({ total: cats.reduce((s, c) => s + c.total, 0) })
    })
  }, [loaded])

  return (
    <>
      {!loaded && <LoadingScreen onDone={handleLoadingDone} />}

      {showContent && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />

          <main style={{ flex: 1 }}>
            {/* Hero */}
            <section style={{
              padding: 'clamp(48px, 8vw, 100px) 24px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* BG grid effect */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
                opacity: 0.3,
                maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.3)',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                }}>
                  Live Rankings - Season 1
                </div>

                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(56px, 12vw, 120px)',
                  letterSpacing: 'clamp(4px, 2vw, 16px)',
                  lineHeight: 1,
                  marginBottom: '8px',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  FALCON
                </h1>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(56px, 12vw, 120px)',
                  letterSpacing: 'clamp(4px, 2vw, 16px)',
                  lineHeight: 1,
                  marginBottom: '24px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  TIERS
                </h1>

                <p style={{
                  fontSize: 'clamp(15px, 2vw, 18px)',
                  color: 'var(--text-secondary)',
                  maxWidth: '500px',
                  margin: '0 auto 36px',
                  lineHeight: 1.7,
                }}>
                  The #1 competitive PvP ranking platform. Find your rank across CPVP, NethPot, and SMP Kit.
                </p>

                {/* Search */}
                <SearchBar />

                {/* Quick links */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
                  <Link href="/rankings/cpvp" className="btn btn-primary">Explore CPVP</Link>
                  <Link href="/register" className="btn btn-outline">Join Now</Link>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: 'clamp(24px, 4vw, 64px)',
                  justifyContent: 'center',
                  marginTop: '56px',
                  flexWrap: 'wrap',
                }}>
                  {[
                    { label: 'Ranked Players', value: stats.total || '...' },
                    { label: 'Categories', value: '3' },
                    { label: 'Tier Badges', value: '10' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(28px, 5vw, 48px)',
                        letterSpacing: '2px',
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                      }}>
                        {s.value}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginTop: '6px',
                        fontWeight: 600,
                      }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Categories */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, marginBottom: '8px' }}>
                  Pick Your Category
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                  Top 3 preview - see the full leaderboard inside
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
              }}>
                {categories.length === 0
                  ? [0, 1, 2].map(i => (
                    <div key={i} className="glass" style={{
                      height: '380px',
                      animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
                      background: 'linear-gradient(270deg, var(--bg-card), var(--bg-glass))',
                      backgroundSize: '200% 200%',
                    }} />
                  ))
                  : categories.map((cat, i) => <CategoryCard key={cat.key} cat={cat} index={i} />)
                }
              </div>
            </section>

            {/* Badge guide section */}
            <section style={{
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              padding: '60px 24px',
              background: 'rgba(255,255,255,0.01)',
            }}>
              <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Tier Badge System</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
                  Badges are assigned by admins based on performance and skill level
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                }}>
                  {[
                    { badge: 'HT1', label: 'High Tier 1', desc: 'Top 1%' },
                    { badge: 'HT2', label: 'High Tier 2', desc: 'Top 5%' },
                    { badge: 'HT3', label: 'High Tier 3', desc: 'Top 10%' },
                    { badge: 'HT4', label: 'High Tier 4', desc: 'Top 20%' },
                    { badge: 'HT5', label: 'High Tier 5', desc: 'Top 35%' },
                    { badge: 'LT1', label: 'Low Tier 1', desc: 'Mid rank' },
                    { badge: 'LT2', label: 'Low Tier 2', desc: 'Lower mid' },
                    { badge: 'LT3', label: 'Low Tier 3', desc: 'Bottom 35%' },
                    { badge: 'LT4', label: 'Low Tier 4', desc: 'Bottom 20%' },
                    { badge: 'LT5', label: 'Low Tier 5', desc: 'Bottom 5%' },
                  ].map(item => (
                    <div key={item.badge} className="glass" style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span className={`badge badge-${item.badge}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                        {item.badge}
                      </span>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      )}
    </>
  )
}
