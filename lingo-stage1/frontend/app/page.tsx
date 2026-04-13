'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'fr', label: 'French',     flag: '🇫🇷' },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸' },
  { code: 'de', label: 'German',     flag: '🇩🇪' },
  { code: 'it', label: 'Italian',    flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', label: 'Japanese',   flag: '🇯🇵' },
  { code: 'zh', label: 'Chinese',    flag: '🇨🇳' },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦' },
  { code: 'ko', label: 'Korean',     flag: '🇰🇷' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [language, setLanguage] = useState('en')
  const [roomName, setRoomName] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState<'new' | 'join'>('new')

  // Auto-generate a room name on load
  useEffect(() => {
    if (tab === 'new') {
      fetch(`${API_URL}/api/rooms/new`)
        .then(r => r.json())
        .then(d => setRoomName(d.room_name))
        .catch(() => setRoomName(`lingo-${Math.random().toString(36).slice(2,8)}`))
    }
  }, [tab])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim())     return setError('Please enter your name.')
    if (!roomName.trim()) return setError('Please enter a room name.')
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_name: roomName.trim(), participant_name: name.trim(), language }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to get token')
      }
      const data = await res.json()
      // Store token + livekit URL in sessionStorage, then navigate to room
      sessionStorage.setItem('lingo_token',        data.token)
      sessionStorage.setItem('lingo_livekit_url',  data.livekit_url)
      sessionStorage.setItem('lingo_display_name', name.trim())
      sessionStorage.setItem('lingo_language',     language)
      router.push(`/room/${encodeURIComponent(roomName.trim())}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Is the backend running?')
      setLoading(false)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.code === language)

  return (
    <main style={styles.main}>
      {/* Blueprint grid background */}
      <div style={styles.grid} />
      {/* Glow orbs */}
      <div style={{ ...styles.orb, width: 500, height: 500, top: -100, right: -100, background: 'rgba(26,86,219,0.15)' }} />
      <div style={{ ...styles.orb, width: 320, height: 320, bottom: -60, left: '20%', background: 'rgba(0,217,255,0.08)' }} />

      <div style={styles.center}>
        {/* Logo / wordmark */}
        <div className="animate-fade-up" style={styles.logoWrap}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>lingo</span>
        </div>

        <h1 className="animate-fade-up-1" style={styles.headline}>
          Speak your language.<br />
          <span className="gradient-text">Understand everyone.</span>
        </h1>

        <p className="animate-fade-up-2" style={styles.sub}>
          Real-time AI translation so every conversation flows naturally — no matter what language anyone speaks.
        </p>

        {/* Join card */}
        <div className="animate-fade-up-3 glass-card" style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {(['new', 'join'] as const).map(t => (
              <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
                {t === 'new' ? '+ New room' : '→ Join room'}
              </button>
            ))}
          </div>

          <form onSubmit={handleJoin} style={styles.form}>
            {/* Name */}
            <label style={styles.label}>Your name</label>
            <input
              style={styles.input}
              placeholder="e.g. Alex"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="off"
            />

            {/* Language */}
            <label style={styles.label}>Your language</label>
            <div style={styles.langGrid}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  style={{ ...styles.langBtn, ...(language === l.code ? styles.langBtnActive : {}) }}
                >
                  <span style={{ fontSize: 18 }}>{l.flag}</span>
                  <span style={{ fontSize: 11, marginTop: 2 }}>{l.label}</span>
                </button>
              ))}
            </div>

            {/* Room name */}
            <label style={styles.label}>{tab === 'new' ? 'Room name (share this link)' : 'Room code'}</label>
            <input
              style={styles.input}
              placeholder="room-name"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              readOnly={tab === 'new'}
              onClick={tab === 'new' ? () => setTab('join') : undefined}
            />
            {tab === 'new' && (
              <span style={styles.hint}>
                Share this code with anyone you want to call.
              </span>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading
                ? <span style={styles.spinner} />
                : tab === 'new'
                  ? `Start call in ${selectedLang?.flag} ${selectedLang?.label} →`
                  : `Join as ${selectedLang?.flag} ${selectedLang?.label} →`
              }
            </button>
          </form>
        </div>

        <p className="animate-fade-up-3" style={styles.footer}>
          Stage 1 · WebRTC foundation · Translation coming in Stage 3
        </p>
      </div>
    </main>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '2rem',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(26,86,219,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,86,219,0.06) 1px,transparent 1px)',
    backgroundSize: '60px 60px',
  },
  orb: {
    position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0,
  },
  center: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: '100%', maxWidth: 520,
    textAlign: 'center',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: '2rem',
  },
  logoDot: {
    width: 10, height: 10, borderRadius: '50%',
    background: 'var(--cyan)',
    animation: 'pulse 2s infinite',
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '1.5rem', fontWeight: 800,
    letterSpacing: '-0.04em',
    color: 'var(--white)',
  },
  headline: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(2rem,5vw,3rem)',
    fontWeight: 800, lineHeight: 1.1,
    letterSpacing: '-0.03em',
    marginBottom: '1rem',
  },
  sub: {
    color: 'var(--muted)', fontSize: '1rem', fontWeight: 300,
    lineHeight: 1.7, maxWidth: 420, marginBottom: '2.5rem',
  },
  card: {
    width: '100%', padding: '2rem',
    marginBottom: '1.5rem',
  },
  tabs: {
    display: 'flex', gap: 4,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8, padding: 4,
    marginBottom: '1.5rem',
  },
  tab: {
    flex: 1, padding: '0.5rem',
    background: 'transparent', border: 'none',
    borderRadius: 6, color: 'var(--muted)',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: 500,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(255,255,255,0.08)',
    color: 'var(--white)',
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left',
  },
  label: {
    fontSize: '0.72rem', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500,
    marginTop: '0.75rem',
  },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--glass-border)',
    borderRadius: 8, padding: '0.75rem 1rem',
    color: 'var(--white)', fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem', width: '100%',
    transition: 'border-color 0.2s',
  },
  langGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
    marginTop: 4,
  },
  langBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0.5rem 0.25rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: 8, color: 'var(--muted)',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  langBtnActive: {
    background: 'rgba(26,86,219,0.2)',
    border: '1px solid rgba(37,99,235,0.5)',
    color: 'var(--white)',
  },
  hint: {
    fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4,
  },
  error: {
    color: '#f87171', fontSize: '0.85rem',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 6, padding: '0.6rem 0.8rem',
    marginTop: '0.25rem',
  },
  btnPrimary: {
    marginTop: '1rem',
    background: 'linear-gradient(135deg, var(--blue2), #1e40af)',
    border: 'none', borderRadius: 8,
    color: '#fff', fontFamily: "'Syne', sans-serif",
    fontSize: '0.95rem', fontWeight: 700,
    padding: '0.9rem',
    boxShadow: '0 4px 20px rgba(26,86,219,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, minHeight: 48,
  },
  spinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  footer: {
    color: 'var(--muted)', fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
}
