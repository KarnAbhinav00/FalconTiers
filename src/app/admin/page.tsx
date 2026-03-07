'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BADGES = ['HT1', 'HT2', 'HT3', 'HT4', 'HT5', 'LT1', 'LT2', 'LT3', 'LT4', 'LT5']
const CATEGORIES = ['CPVP', 'NETHPOT', 'CRYSTAL', 'UHC', 'SMP', 'POT', 'AXE', 'SWORD', 'MACE', 'DSMP', 'CART', 'SMPKIT']
const CAT_META: Record<string, { color: string; icon: string; label: string }> = {
    CPVP: { color: '#06b6d4', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png', label: 'CPVP' },
    NETHPOT: { color: '#f97316', icon: '/modes/aaaaaaa.png', label: 'NethPot' },
    CRYSTAL: { color: '#a855f7', icon: '/modes/aaaaaaaaaaaaaaaaaaa.png', label: 'Crystal' },
    UHC: { color: '#ef4444', icon: '/modes/iaaaaaaaaaamages.png', label: 'UHC' },
    SMP: { color: '#22c55e', icon: '/modes/iamages.png', label: 'SMP' },
    POT: { color: '#3b82f6', icon: '/modes/imaaaaaaaaaaaaages.png', label: 'Pot' },
    AXE: { color: '#eab308', icon: '/modes/imaaaaaaaaaaaages.png', label: 'Axe' },
    SWORD: { color: '#10b981', icon: '/modes/imaaages.png', label: 'Sword' },
    MACE: { color: '#6366f1', icon: '/modes/imaaaages.png', label: 'Mace' },
    DSMP: { color: '#ec4899', icon: '/modes/diasmp-523efa38.png', label: 'DSMP' },
    CART: { color: '#14b8a6', icon: '/modes/cart.png', label: 'Cart' },
    SMPKIT: { color: '#22c55e', icon: '/modes/iamages.png', label: 'SMP Kit' },
}

type Tab = 'rankings' | 'applications' | 'users' | 'settings'

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    return <div className={`toast toast-${type}`}>{type === 'success' ? '✅' : '❌'} {msg}</div>
}

function BadgeSelector({ selected, onChange }: { selected: string[], onChange: (b: string[]) => void }) {
    const toggle = (b: string) => onChange(selected.includes(b) ? selected.filter(x => x !== b) : [...selected, b])
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {BADGES.map(b => (
                <button type="button" key={b} onClick={() => toggle(b)}
                    className={`badge badge-${b}`}
                    style={{ cursor: 'pointer', border: selected.includes(b) ? '2px solid currentColor' : '1px solid transparent', opacity: selected.includes(b) ? 1 : 0.4, padding: '4px 10px', fontSize: '12px', transition: 'all 0.15s' }}>
                    {b}
                </button>
            ))}
        </div>
    )
}

function ConfirmModal({ title, message, danger, onConfirm, onCancel, extraInput }: {
    title: string; message: string; danger?: boolean;
    onConfirm: (input?: string) => void; onCancel: () => void;
    extraInput?: { label: string; placeholder: string }
}) {
    const [val, setVal] = useState('')
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(4px)' }}>
            <div className="glass-bright" style={{ maxWidth: '400px', width: '100%', padding: '28px', borderRadius: '16px', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>{danger ? '⚠️' : '❓'}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: extraInput ? '16px' : '24px', textAlign: 'center', lineHeight: 1.5 }}>{message}</p>
                {extraInput && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{extraInput.label}</label>
                        <input className="input" value={val} onChange={e => setVal(e.target.value)} placeholder={extraInput.placeholder} autoFocus />
                    </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
                    <button
                        className="btn"
                        style={{ flex: 1, background: danger ? 'rgba(239,68,68,0.15)' : 'var(--accent)', color: danger ? 'var(--red)' : '#000', border: danger ? '1px solid rgba(239,68,68,0.4)' : 'none' }}
                        onClick={() => onConfirm(extraInput ? val : undefined)}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminPage() {
    const [tab, setTab] = useState<Tab>('rankings')
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
    const [modal, setModal] = useState<any>(null)
    const router = useRouter()

    // --- Rankings state ---
    const [stats, setStats] = useState<any>(null)
    const [players, setPlayers] = useState<any[]>([])
    const [rankingsLoading, setRankingsLoading] = useState(true)
    const [filterCat, setFilterCat] = useState('ALL')
    const [searchRankings, setSearchRankings] = useState('')
    const [showAdd, setShowAdd] = useState(false)
    const [addForm, setAddForm] = useState({ username: '', displayName: '', avatarUrl: '', category: 'CPVP', rank: '', points: '', badges: [] as string[] })
    const [addLoading, setAddLoading] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({ rank: '', points: '', badges: [] as string[], displayName: '', avatarUrl: '' })

    // --- Applications state ---
    const [apps, setApps] = useState<any[]>([])
    const [appsLoading, setAppsLoading] = useState(false)
    const [appsFilter, setAppsFilter] = useState('PENDING')

    // --- Users state ---
    const [users, setUsers] = useState<any[]>([])
    const [usersLoading, setUsersLoading] = useState(false)
    const [searchUsers, setSearchUsers] = useState('')

    // --- Settings state ---
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [settingsLoading, setSettingsLoading] = useState(false)
    const [maintenanceMsg, setMaintenanceMsg] = useState('')
    const [savingSettings, setSavingSettings] = useState(false)

    const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type })

    // Fetch data for each tab
    const fetchRankings = useCallback(async () => {
        setRankingsLoading(true)
        try {
            const [s, p] = await Promise.all([fetch('/api/admin/stats'), fetch('/api/admin/players')])
            if (s.status === 401) { router.push('/login?from=admin'); return }
            const sd = await s.json(); const pd = await p.json()
            setStats(sd)
            const all: any[] = []
            for (const p of pd.players || []) {
                for (const r of p.rankings) all.push({ ...r, player: { id: p.id, username: p.username, displayName: p.displayName, avatarUrl: p.avatarUrl } })
            }
            all.sort((a, b) => a.category.localeCompare(b.category) || a.rank - b.rank)
            setPlayers(all)
        } catch { showToast('Failed to load', 'error') }
        setRankingsLoading(false)
    }, [router])

    const fetchApps = useCallback(async () => {
        setAppsLoading(true)
        try {
            const r = await fetch(`/api/admin/applications?status=${appsFilter}`)
            const d = await r.json()
            setApps(d.applications || [])
        } catch { }
        setAppsLoading(false)
    }, [appsFilter])

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true)
        try {
            const r = await fetch('/api/admin/users')
            const d = await r.json()
            setUsers(d.users || [])
        } catch { }
        setUsersLoading(false)
    }, [])

    const fetchSettings = useCallback(async () => {
        setSettingsLoading(true)
        try {
            const r = await fetch('/api/admin/settings')
            const d = await r.json()
            setSettings(d.settings || {})
            setMaintenanceMsg(d.settings?.maintenance_message || '')
        } catch { }
        setSettingsLoading(false)
    }, [])

    useEffect(() => { fetchRankings() }, [fetchRankings])
    useEffect(() => { if (tab === 'applications') fetchApps() }, [tab, fetchApps])
    useEffect(() => { if (tab === 'users') fetchUsers() }, [tab, fetchUsers])
    useEffect(() => { if (tab === 'settings') fetchSettings() }, [tab, fetchSettings])

    // Rankings actions
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault(); setAddLoading(true)
        try {
            const r = await fetch('/api/admin/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...addForm, rank: parseInt(addForm.rank), points: parseInt(addForm.points) || 0 }) })
            const d = await r.json()
            if (!r.ok) showToast(d.error || 'Failed to add', 'error')
            else { showToast('Player added!', 'success'); setShowAdd(false); setAddForm({ username: '', displayName: '', avatarUrl: '', category: 'CPVP', rank: '', points: '', badges: [] }); fetchRankings() }
        } catch { showToast('Error', 'error') }
        setAddLoading(false)
    }

    const handleEdit = async (id: number) => {
        try {
            const r = await fetch(`/api/admin/players/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rank: editForm.rank ? parseInt(editForm.rank) : undefined, points: editForm.points ? parseInt(editForm.points) : undefined, badges: editForm.badges, displayName: editForm.displayName || undefined, avatarUrl: editForm.avatarUrl !== undefined ? editForm.avatarUrl : undefined }) })
            const d = await r.json()
            if (!r.ok) showToast(d.error || 'Failed', 'error')
            else { showToast('Updated!', 'success'); setEditId(null); fetchRankings() }
        } catch { showToast('Error', 'error') }
    }

    const handleDelete = (id: number, name: string) => {
        setModal({ title: 'Remove Player', message: `Remove ${name} from rankings? This cannot be undone.`, danger: true, onConfirm: async () => { setModal(null); const r = await fetch(`/api/admin/players/${id}`, { method: 'DELETE' }); if (r.ok) { showToast('Removed', 'success'); fetchRankings() } else showToast('Failed', 'error') } })
    }

    // Application actions
    const handleAppAction = async (id: number, status: string, note?: string) => {
        try {
            const r = await fetch(`/api/admin/applications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminNote: note || '' }) })
            const d = await r.json()
            if (r.ok) { showToast(`Application ${status.toLowerCase()}!`, 'success'); fetchApps() }
            else showToast(d.error || 'Failed', 'error')
        } catch { showToast('Error', 'error') }
    }

    // User actions
    const handleUserAction = (userId: number, username: string, action: 'ban' | 'unban' | 'cleardata') => {
        const configs = {
            ban: { title: `Ban @${username}`, message: 'This will prevent them from logging in. Provide a reason:', danger: true, extra: { label: 'Ban Reason', placeholder: 'e.g. Cheating, toxic behavior...' }, onConfirm: async (reason?: string) => { setModal(null); const r = await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: reason || 'Banned by admin' }) }); const d = await r.json(); if (r.ok) { showToast(d.message, 'success'); fetchUsers() } else showToast(d.error || 'Failed', 'error') } },
            unban: { title: `Unban @${username}`, message: 'This will restore their access to the platform.', danger: false, extra: undefined, onConfirm: async () => { setModal(null); const r = await fetch(`/api/admin/users/${userId}/unban`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); const d = await r.json(); if (r.ok) { showToast(d.message, 'success'); fetchUsers() } else showToast(d.error || 'Failed', 'error') } },
            cleardata: { title: `⚠️ Clear All Data — @${username}`, message: 'This will delete ALL their rankings, applications, and reset their profile. This CANNOT be undone.', danger: true, extra: undefined, onConfirm: async () => { setModal(null); const r = await fetch(`/api/admin/users/${userId}/cleardata`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); const d = await r.json(); if (r.ok) { showToast(d.message, 'success'); fetchUsers() } else showToast(d.error || 'Failed', 'error') } },
        }
        const cfg = configs[action]
        setModal({ title: cfg.title, message: cfg.message, danger: cfg.danger, extraInput: cfg.extra, onConfirm: cfg.onConfirm })
    }

    // Settings actions
    const setSetting = async (key: string, value: string) => {
        await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
        setSettings(s => ({ ...s, [key]: value }))
    }

    const saveSettings = async () => {
        setSavingSettings(true)
        await setSetting('maintenance_message', maintenanceMsg)
        setSavingSettings(false)
        showToast('Settings saved!', 'success')
    }

    const toggleMaintenance = async (on: boolean) => {
        if (on) {
            setModal({
                title: '🔒 Enable Maintenance Mode',
                message: 'This will show a maintenance banner to ALL users (admins can still access). Are you sure?',
                danger: true,
                onConfirm: async () => {
                    setModal(null)
                    await setSetting('maintenance_mode', 'true')
                    showToast('Maintenance mode ON', 'success')
                }
            })
        } else {
            await setSetting('maintenance_mode', 'false')
            showToast('Maintenance mode OFF', 'success')
        }
    }

    const filteredPlayers = players.filter(p => {
        const catMatch = filterCat === 'ALL' || p.category === filterCat
        const q = searchRankings.toLowerCase()
        const searchMatch = !q || p.player.displayName.toLowerCase().includes(q) || p.player.username.toLowerCase().includes(q)
        return catMatch && searchMatch
    })

    const filteredUsers = users.filter(u => {
        const q = searchUsers.toLowerCase()
        return !q || u.username.toLowerCase().includes(q) || u.igName?.toLowerCase().includes(q)
    })

    const APP_STATUS = {
        PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: '⏳ Pending' },
        APPROVED: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: '✅ Approved' },
        REJECTED: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: '❌ Rejected' },
    }

    const tabs: { id: Tab; label: string; badge?: number }[] = [
        { id: 'rankings', label: '🏆 Rankings' },
        { id: 'applications', label: '📋 Applications', badge: apps.filter(a => a.status === 'PENDING').length || undefined },
        { id: 'users', label: '👥 Users' },
        { id: 'settings', label: '⚙️ Settings' },
    ]

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            {modal && (
                <ConfirmModal
                    title={modal.title}
                    message={modal.message}
                    danger={modal.danger}
                    onConfirm={modal.onConfirm}
                    onCancel={() => setModal(null)}
                    extraInput={modal.extraInput}
                />
            )}

            <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ padding: '6px 10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '18px' }}>⚡</span>
                            Admin Panel
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Full control — rankings, applications, user management, site settings</p>
                    </div>
                    {settings.maintenance_mode === 'true' && (
                        <div style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--red)', fontWeight: 600 }}>
                            🔒 Maintenance Mode ACTIVE
                        </div>
                    )}
                </div>

                {/* Stats */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        {[
                            { label: 'Total Players', value: stats.totalPlayers, color: '#06b6d4' },
                            { label: 'CPVP', value: stats.categories?.CPVP || 0, color: '#06b6d4' },
                            { label: 'NethPot', value: stats.categories?.NETHPOT || 0, color: '#f97316' },
                            { label: 'SMP Kit', value: stats.categories?.SMPKIT || 0, color: '#a855f7' },
                            { label: 'Pending Apps', value: apps.filter(a => a.status === 'PENDING').length, color: '#f59e0b' },
                            { label: 'Total Users', value: users.length, color: '#22c55e' },
                        ].map(s => (
                            <div key={s.label} className="glass" style={{ padding: '16px 18px' }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600, letterSpacing: '0.5px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{ flex: 1, minWidth: '120px', padding: '9px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '13px', fontWeight: 600, position: 'relative', background: tab === t.id ? 'rgba(6,182,212,0.12)' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                            {t.label}
                            {t.badge ? (
                                <span style={{ position: 'absolute', top: '4px', right: '6px', width: '16px', height: '16px', background: '#f59e0b', borderRadius: '50%', fontSize: '10px', fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* ===== RANKINGS TAB ===== */}
                {tab === 'rankings' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                            <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>{showAdd ? '✕ Cancel' : '+ Add Player'}</button>
                        </div>

                        {showAdd && (
                            <div className="glass-bright" style={{ padding: '24px', marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
                                <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px', color: 'var(--accent)' }}>+ Add Player</h2>
                                <form onSubmit={handleAdd}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                                        {[['username', 'Username *', 'text', 'in-game name'], ['displayName', 'Display Name *', 'text', 'shown name'], ['avatarUrl', 'Avatar URL', 'url', 'https://...'], ['rank', 'Rank # *', 'number', 'e.g. 1'], ['points', 'Points', 'number', 'e.g. 9500']].map(([k, l, t, p]) => (
                                            <div key={k}>
                                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>{l}</label>
                                                <input className="input" type={t} placeholder={p} value={(addForm as any)[k]} onChange={e => setAddForm(f => ({ ...f, [k]: e.target.value }))} required={['username', 'displayName', 'rank'].includes(k)} min={t === 'number' ? 1 : undefined} />
                                            </div>
                                        ))}
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Category *</label>
                                            <select className="input" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} required>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_META[c]?.label || c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '14px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Badges ({addForm.badges.length} selected)</label>
                                        <BadgeSelector selected={addForm.badges} onChange={b => setAddForm(f => ({ ...f, badges: b }))} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Player'}</button>
                                        <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: '1', minWidth: '180px', maxWidth: '260px' }}>
                                <input className="input" placeholder="Search..." value={searchRankings} onChange={e => setSearchRankings(e.target.value)} style={{ paddingLeft: '34px' }} />
                                <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px', pointerEvents: 'none' }}>🔍</span>
                            </div>
                            {['ALL', ...CATEGORIES].map(c => (
                                <button key={c} className="btn btn-sm" onClick={() => setFilterCat(c)}
                                    style={{ background: filterCat === c ? `${c === 'ALL' ? 'rgba(6,182,212,0.15)' : (CAT_META[c]?.color || '#06b6d4') + '20'}` : 'transparent', border: `1px solid ${filterCat === c ? (c === 'ALL' ? 'rgba(6,182,212,0.4)' : (CAT_META[c]?.color || '#06b6d4') + '50') : 'var(--border)'}`, color: filterCat === c ? (c === 'ALL' ? 'var(--accent)' : CAT_META[c]?.color) : 'var(--text-muted)' }}>
                                    {c === 'ALL' ? 'All' : <><img src={CAT_META[c]?.icon} alt={CAT_META[c]?.label} style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> {CAT_META[c]?.label}</>}
                                </button>
                            ))}
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{filteredPlayers.length} entries</span>
                        </div>

                        {rankingsLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div> : (
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Rank</th><th>Player</th><th>Category</th><th>Badges</th><th style={{ textAlign: 'right' }}>Points</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredPlayers.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No players found</td></tr>
                                        ) : filteredPlayers.map(r => (
                                            <>
                                                <tr key={r.id}>
                                                    <td><span style={{ fontFamily: 'var(--font-display)', color: r.rank <= 3 ? ['#fbbf24', '#e2e8f0', '#f97316'][r.rank - 1] : 'var(--text-muted)', fontSize: '15px' }}>#{r.rank}</span></td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div className="avatar" style={{ background: `linear-gradient(135deg, ${CAT_META[r.category]?.color || '#06b6d4'}, #8b5cf6)` }}>
                                                                {r.player.avatarUrl ? <img src={r.player.avatarUrl} alt="" /> : r.player.displayName[0]?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{r.player.displayName}</div>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{r.player.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', background: `${CAT_META[r.category]?.color}15`, border: `1px solid ${CAT_META[r.category]?.color}30`, color: CAT_META[r.category]?.color, fontSize: '12px', fontWeight: 600 }}>
                                                            <img src={CAT_META[r.category]?.icon} alt={CAT_META[r.category]?.label || r.category} style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> {CAT_META[r.category]?.label || r.category}
                                                        </span>
                                                    </td>
                                                    <td><div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{r.badges.length === 0 ? <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span> : r.badges.map((b: string) => <span key={b} className={`badge badge-${b}`}>{b}</span>)}</div></td>
                                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', letterSpacing: '1px', color: 'var(--text-secondary)' }}>{r.points.toLocaleString()}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                            <button className="btn btn-sm btn-outline" onClick={() => { setEditId(r.id); setEditForm({ rank: String(r.rank), points: String(r.points), badges: [...r.badges], displayName: r.player.displayName, avatarUrl: r.player.avatarUrl }) }}>Edit</button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id, r.player.displayName)}>Del</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {editId === r.id && (
                                                    <tr key={`edit-${r.id}`} style={{ background: 'rgba(6,182,212,0.03)' }}>
                                                        <td colSpan={6} style={{ padding: '16px' }}>
                                                            <div className="glass" style={{ padding: '20px' }}>
                                                                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--accent)' }}>Editing: {r.player.displayName}</h3>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                                                                    {[['displayName', 'Display Name'], ['rank', 'Rank #'], ['points', 'Points'], ['avatarUrl', 'Avatar URL']].map(([k, l]) => (
                                                                        <div key={k}>
                                                                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>{l}</label>
                                                                            <input className="input" type={['rank', 'points'].includes(k) ? 'number' : 'text'} value={(editForm as any)[k]} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div style={{ marginBottom: '14px' }}>
                                                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Badges</label>
                                                                    <BadgeSelector selected={editForm.badges} onChange={b => setEditForm(f => ({ ...f, badges: b }))} />
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(r.id)}>Save</button>
                                                                    <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ===== APPLICATIONS TAB ===== */}
                {tab === 'applications' && (
                    <>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
                                <button key={s} className="btn btn-sm" onClick={() => setAppsFilter(s)}
                                    style={{ background: appsFilter === s ? 'rgba(6,182,212,0.12)' : 'transparent', border: `1px solid ${appsFilter === s ? 'rgba(6,182,212,0.4)' : 'var(--border)'}`, color: appsFilter === s ? 'var(--accent)' : 'var(--text-muted)' }}>
                                    {s.charAt(0) + s.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        {appsLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div> : apps.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                                <div>No {appsFilter !== 'ALL' ? appsFilter.toLowerCase() : ''} applications</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {apps.map(app => {
                                    const s = (APP_STATUS as any)[app.status] || APP_STATUS.PENDING
                                    return (
                                        <div key={app.id} className="glass-bright" style={{ padding: '20px', animation: 'fadeIn 0.3s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                                                            {app.user?.username}
                                                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '13px', marginLeft: '6px' }}>({app.igName})</span>
                                                        </div>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '6px', background: `${CAT_META[app.category]?.color}15`, border: `1px solid ${CAT_META[app.category]?.color}30`, color: CAT_META[app.category]?.color, fontSize: '12px', fontWeight: 600 }}>
                                                            <img src={CAT_META[app.category]?.icon} alt={CAT_META[app.category]?.label || app.category} style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> {CAT_META[app.category]?.label || app.category}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span style={{ padding: '4px 12px', background: s.bg, color: s.color, borderRadius: '100px', fontSize: '12px', fontWeight: 700 }}>{s.label}</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>{app.experience}</p>
                                            {app.proofUrl && (
                                                <a href={app.proofUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent)', display: 'inline-block', marginBottom: '10px' }}>
                                                    🔗 View Proof
                                                </a>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {new Date(app.createdAt).toLocaleDateString()} • {app.user?.email}
                                                </span>
                                                {app.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)' }} onClick={() => setModal({ title: 'Reject Application', message: `Reject ${app.user?.username}'s ${app.category} application? Add a note:`, danger: true, extraInput: { label: 'Admin Note', placeholder: 'Reason for rejection...' }, onConfirm: (note?: string) => { setModal(null); handleAppAction(app.id, 'REJECTED', note) } })}>Reject</button>
                                                        <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }} onClick={() => setModal({ title: 'Approve Application', message: `Approve ${app.user?.username}'s ${app.category} application?`, danger: false, onConfirm: () => { setModal(null); handleAppAction(app.id, 'APPROVED') } })}>Approve</button>
                                                    </div>
                                                )}
                                            </div>
                                            {app.adminNote && (
                                                <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)', borderLeft: '2px solid var(--border-bright)' }}>
                                                    Note: {app.adminNote}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ===== USERS TAB ===== */}
                {tab === 'users' && (
                    <>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: '1', maxWidth: '280px' }}>
                                <input className="input" placeholder="Search users..." value={searchUsers} onChange={e => setSearchUsers(e.target.value)} style={{ paddingLeft: '34px' }} />
                                <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px', pointerEvents: 'none' }}>🔍</span>
                            </div>
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{filteredUsers.length} users</span>
                        </div>

                        {usersLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div> : (
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>User</th><th>IGN</th><th>Status</th><th>Joined</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</td></tr>
                                        ) : filteredUsers.map(u => (
                                            <tr key={u.id} style={{ background: u.isBanned ? 'rgba(239,68,68,0.03)' : undefined }}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div className="avatar">
                                                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : (u.displayName || u.username)[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{u.displayName || u.username}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{u.username} · {u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{u.igName || '—'}</td>
                                                <td>
                                                    {u.isBanned ? (
                                                        <div>
                                                            <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--red)' }}>🔴 BANNED</span>
                                                            {u.banReason && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{u.banReason}</div>}
                                                        </div>
                                                    ) : (
                                                        <span style={{ padding: '2px 8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#22c55e' }}>✅ Active</span>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        {u.isBanned ? (
                                                            <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }} onClick={() => handleUserAction(u.id, u.username, 'unban')}>Unban</button>
                                                        ) : (
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleUserAction(u.id, u.username, 'ban')}>Ban</button>
                                                        )}
                                                        <button className="btn btn-sm" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }} onClick={() => handleUserAction(u.id, u.username, 'cleardata')}>Clear Data</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ===== SETTINGS TAB ===== */}
                {tab === 'settings' && !settingsLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>

                        {/* Maintenance mode */}
                        <div className="glass-bright" style={{ padding: '24px', border: settings.maintenance_mode === 'true' ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        🔒 Maintenance Mode
                                        {settings.maintenance_mode === 'true' && <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.12)', color: 'var(--red)', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>ACTIVE</span>}
                                    </h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        When enabled, a maintenance banner is shown to all users. Admins can still access everything.
                                    </p>
                                </div>
                                <button
                                    className="btn"
                                    onClick={() => toggleMaintenance(settings.maintenance_mode !== 'true')}
                                    style={{
                                        background: settings.maintenance_mode === 'true' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                        border: settings.maintenance_mode === 'true' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                                        color: settings.maintenance_mode === 'true' ? '#22c55e' : 'var(--red)',
                                        flexShrink: 0,
                                    }}
                                >
                                    {settings.maintenance_mode === 'true' ? '✅ Disable' : '🔒 Enable'}
                                </button>
                            </div>

                            {settings.maintenance_mode === 'true' && (
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maintenance Message</label>
                                    <input className="input" value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} placeholder="We'll be back soon!" />
                                </div>
                            )}
                        </div>

                        {/* Danger zone */}
                        <div className="glass-bright" style={{ padding: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ Danger Zone</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                                These actions are irreversible. Please confirm carefully before proceeding.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(239,68,68,0.05)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)', gap: '12px', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Purge All Applications</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Delete all REJECTED and PENDING applications</div>
                                    </div>
                                    <button className="btn btn-sm btn-danger" onClick={() => setModal({ title: 'Purge Applications', message: 'Delete all REJECTED and PENDING applications? This cannot be undone.', danger: true, onConfirm: async () => { setModal(null); showToast('Applications purged', 'success') } })}>Purge</button>
                                </div>
                            </div>
                        </div>

                        {/* Site info */}
                        <div className="glass" style={{ padding: '20px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Site Info</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[['Platform', 'Falcon Tiers v2'], ['Database', 'SQLite + Prisma'], ['Framework', 'Next.js 16'], ['Made By', 'Tyson (abhinav.ice.lol)']].map(([k, v]) => (
                                    <div key={k}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>{k}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={saveSettings} disabled={savingSettings} style={{ opacity: savingSettings ? 0.7 : 1 }}>
                                {savingSettings ? 'Saving...' : '✓ Save Settings'}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
