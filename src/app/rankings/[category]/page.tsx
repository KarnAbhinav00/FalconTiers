'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Ranking {
  id: number
  rank: number
  points: number
  badges: string[]
  player: { id: number; username: string; displayName: string; avatarUrl: string }
}

const CATEGORY_META: Record<string, { api: string; label: string; color: string; icon: string; longName: string }> = {
  cpvp: { api: 'CPVP', label: 'CPVP', color: '#06b6d4', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png', longName: 'Crystal PvP' },
  nethpot: { api: 'NETHPOT', label: 'NethPot', color: '#f97316', icon: '/modes/aaaaaaa.png', longName: 'Nether Potion PvP' },
  crystal: { api: 'CRYSTAL', label: 'Crystal', color: '#a855f7', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png', longName: 'Crystal PvP' },
  uhc: { api: 'UHC', label: 'UHC', color: '#ef4444', icon: '/modes/iaaaaaaaaaamages.png', longName: 'Ultra Hardcore' },
  smp: { api: 'SMP', label: 'SMP', color: '#22c55e', icon: '/modes/iamages.png', longName: 'SMP PvP' },
  pot: { api: 'POT', label: 'Pot', color: '#3b82f6', icon: '/modes/imaaaaaaaaaaaaages.png', longName: 'Potion PvP' },
  axe: { api: 'AXE', label: 'Axe', color: '#eab308', icon: '/modes/imaaaaaaaaaaaages.png', longName: 'Axe PvP' },
  sword: { api: 'SWORD', label: 'Sword', color: '#10b981', icon: '/modes/imaaages.png', longName: 'Sword PvP' },
  mace: { api: 'MACE', label: 'Mace', color: '#6366f1', icon: '/modes/imaaaages.png', longName: 'Mace PvP' },
  dsmp: { api: 'DSMP', label: 'DSMP', color: '#ec4899', icon: '/modes/diasmp-523efa38.png', longName: 'Dream SMP' },
  cart: { api: 'CART', label: 'Cart', color: '#14b8a6', icon: '/modes/cart.png', longName: 'Cart PvP' },
  smpkit: { api: 'SMPKIT', label: 'SMP Kit', color: '#22c55e', icon: '/modes/iamages.png', longName: 'SMP Kit PvP' },
}

function BadgePill({ badge }: { badge: string }) {
  return <span className={`badge badge-${badge}`}>{badge}</span>
}

function RankNumber({ rank }: { rank: number }) {
  const color = rank === 1 ? '#fbbf24' : rank === 2 ? '#e2e8f0' : rank === 3 ? '#f97316' : 'var(--text-muted)'
  return (
    <span style={{ color, fontWeight: rank <= 3 ? 800 : 600, minWidth: '42px', display: 'inline-block', textAlign: 'right' }}>
      #{rank}
    </span>
  )
}

export default function RankingsPage() {
  const params = useParams()
  const category = String(params.category || '').toLowerCase()
  const meta = CATEGORY_META[category]
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchRankings = useCallback(async (currentPage: number) => {
    if (!meta) return
    setLoading(true)
    try {
      const res = await fetch(`/api/players?category=${meta.api}&page=${currentPage}&limit=100`)
      const data = await res.json()
      setRankings(data.rankings || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      setRankings([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [meta])

  useEffect(() => {
    fetchRankings(page)
  }, [fetchRankings, page])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rankings
    return rankings.filter((row) =>
      row.player.displayName.toLowerCase().includes(query) ||
      row.player.username.toLowerCase().includes(query)
    )
  }, [rankings, search])

  if (!meta) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Category not found</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Use one of the supported tier categories.</p>
            <Link href="/" className="btn btn-primary">Go Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <section style={{ padding: '36px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <img src={meta.icon} alt={meta.label} style={{ width: '28px', height: '28px' }} />
              <h1 style={{ fontSize: '34px', color: meta.color }}>{meta.label}</h1>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{meta.longName}</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {total} ranked players | showing {filtered.length} {search ? 'search results' : `on page ${page}`}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {Object.entries(CATEGORY_META).map(([slug, item]) => (
                <Link
                  key={slug}
                  href={`/rankings/${slug}`}
                  className="btn btn-sm"
                  style={{
                    background: slug === category ? `${item.color}22` : 'transparent',
                    border: `1px solid ${slug === category ? `${item.color}55` : 'var(--border)'}`,
                    color: slug === category ? item.color : 'var(--text-muted)',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="input"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '360px' }}
            />
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Page {page} / {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass" style={{ padding: '34px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No players found.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '72px' }}>Rank</th>
                    <th>Player</th>
                    <th>Badges</th>
                    <th style={{ textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td><RankNumber rank={row.rank} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div className="avatar">
                            {row.player.avatarUrl ? <img src={row.player.avatarUrl} alt={row.player.displayName} /> : row.player.displayName[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.player.displayName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{row.player.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {row.badges.length === 0 ? <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span> : row.badges.map((b) => <BadgePill key={b} badge={b} />)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.points.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
