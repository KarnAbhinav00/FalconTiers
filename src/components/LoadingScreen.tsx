'use client'

import { useEffect, useState } from 'react'

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const phases = ['Initializing...', 'Loading Rankings...', 'Calibrating Tiers...', 'Ready.']
        let p = 0
        const interval = setInterval(() => {
            p += Math.random() * 18 + 5
            if (p >= 100) {
                p = 100
                setProgress(100)
                setPhase(3)
                clearInterval(interval)
                setTimeout(onDone, 500)
            } else {
                setProgress(Math.min(p, 100))
                setPhase(Math.floor((p / 100) * 3))
            }
        }, 80)
        return () => clearInterval(interval)
    }, [onDone])

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'var(--bg-primary)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '32px'
        }}>
            {/* Logo */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: 'clamp(48px, 10vw, 96px)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '8px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                }}>
                    FALCON
                </div>
                <div style={{
                    fontSize: 'clamp(20px, 4vw, 36px)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '16px',
                    color: 'var(--text-secondary)',
                    marginTop: '-4px',
                }}>
                    TIERS
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '240px', textAlign: 'center' }}>
                <div style={{
                    height: '3px',
                    background: 'var(--border)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '12px',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, var(--accent), #8b5cf6)',
                        borderRadius: '2px',
                        transition: 'width 0.1s ease',
                    }} />
                </div>
                <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }}>
                    {['Initializing...', 'Loading Rankings...', 'Calibrating Tiers...', 'Ready.'][phase]}
                </div>
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: i < phase ? 'var(--accent)' : 'var(--border)',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>
        </div>
    )
}
