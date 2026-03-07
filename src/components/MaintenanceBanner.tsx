'use client'

import { useEffect, useState } from 'react'

export default function MaintenanceBanner() {
    const [data, setData] = useState({ maintenance: false, message: '' })

    useEffect(() => {
        fetch('/api/status')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => { })
    }, [])

    if (!data.maintenance) return null

    return (
        <div style={{
            background: 'rgba(239, 68, 68, 0.95)',
            color: 'white',
            textAlign: 'center',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            zIndex: 9999,
            position: 'relative',
            backdropFilter: 'blur(8px)',
        }}>
            ⚠️ MAINTENANCE MODE: {data.message || 'Site is currently under maintenance. Some features may be unavailable.'}
        </div>
    )
}
