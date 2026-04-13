'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const LANG_FLAGS: Record<string,string> = { en:'🇬🇧', fr:'🇫🇷', zh:'🇨🇳', es:'🇪🇸', de:'🇩🇪', ar:'🇸🇦', yo:'🇳🇬', ig:'🇳🇬', pt:'🇧🇷', ja:'🇯🇵', ko:'🇰🇷', sw:'🇰🇪' }
const LANG_NAMES: Record<string,string> = { en:'English', fr:'French', zh:'Mandarin', es:'Spanish', de:'German', ar:'Arabic', yo:'Yoruba', ig:'Igbo', pt:'Portuguese', ja:'Japanese', ko:'Korean', sw:'Swahili' }

export default function Dashboard() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [language, setLanguage] = useState('en')
  const [joinCode, setJoinCode] = useState('')
  const [newRoom, setNewRoom]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [minsUsed] = useState(12)
  const FREE_MINS  = 30

  useEffect(() => {
    const n = sessionStorage.getItem('lingo_display_name')
    const l = sessionStorage.getItem('lingo_language')
    if (!n) { router.replace('/auth'); return }
    setName(n)
    setLanguage(l || 'en')

    // Generate a room name ready to go
    fetch(`${API_URL}/api/rooms/new`)
      .then(r => r.json())
      .then(d => setNewRoom(d.room_name))
      .catch(() => setNewRoom(`bridge-${Math.random().toString(36).slice(2,8)}`))
  }, [router])

  async function startCall(room: string) {
    if (!room.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_name: room.trim(), participant_name: name, language }),
      })
      const data = await res.json()
      sessionStorage.setItem('lingo_token',       data.token)
      sessionStorage.setItem('lingo_livekit_url', data.livekit_url)
      sessionStorage.setItem('lingo_room',        room.trim())
      router.push(`/room/${encodeURIComponent(room.trim())}`)
    } catch {
      setLoading(false)
    }
  }

  const pct = Math.round((minsUsed / FREE_MINS) * 100)
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)

  // Mock recent sessions
  const recent = [
    { partner: 'Wei Zhang',   lang: 'zh', duration: '42m 15s', date: 'Today, 2:30 PM'    },
    { partner: 'Lukas Müller', lang: 'de', duration: '1h 04m',  date: 'Yesterday, 10:00 AM' },
    { partner: 'Yuki Tanaka',  lang: 'ja', duration: '18m 20s', date: 'Dec 14, 3:45 PM'   },
  ]

  return (
    <div style={{ background: '#060e20', color: '#dee5ff', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <Nav />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '6rem 2rem 3rem' }}>
        {/* Welcome bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '0.25rem' }}>
              Welcome back, {name.split(' ')[0]} {LANG_FLAGS[language]}
            </h1>
            <p style={{ color: '#6d758c', fontSize: '0.88rem' }}>Your bridges. Your language. Your deals.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#312E81,#D946EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Manrope',sans-serif", fontWeight: 900, color: '#fff', fontSize: '1rem' }}>{initials}</div>
            <div>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#F8FAFC' }}>{name}</div>
              <div style={{ fontSize: '0.72rem', color: '#6d758c' }}>Free Plan · {FREE_MINS - minsUsed} min left</div>
            </div>
          </div>
        </div>

        {/* Top row: usage + quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Usage card */}
          <div style={{ background: 'rgba(15,25,48,0.7)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 16, padding: '1.75rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#6d758c', marginBottom: '1rem' }}>Monthly usage</div>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '0.25rem' }}>{minsUsed}<span style={{ fontSize: '1rem', color: '#6d758c', fontWeight: 400 }}>/{FREE_MINS} min</span></div>
            <div style={{ background: 'rgba(64,72,93,0.2)', borderRadius: 9999, height: 6, marginBottom: '0.5rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? 'linear-gradient(90deg,#ff8439,#ff6e84)' : 'linear-gradient(90deg,#312E81,#D946EF)', borderRadius: 9999, transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6d758c', marginBottom: '1.25rem' }}>{FREE_MINS - minsUsed} minutes remaining this month</div>
            <Link href="/pricing" style={{ display: 'block', textAlign: 'center', padding: '0.65rem', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', borderRadius: 8, color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              Upgrade to Starter →
            </Link>
          </div>

          {/* Quick start */}
          <div style={{ background: 'rgba(15,25,48,0.7)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 16, padding: '1.75rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#6d758c', marginBottom: '1.25rem' }}>Start a bridge</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* New call */}
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', fontFamily: "'Manrope',sans-serif", marginBottom: '0.4rem' }}>New call</div>
                <p style={{ fontSize: '0.75rem', color: '#6d758c', marginBottom: '1rem', lineHeight: 1.5 }}>Generate a room code and share it with anyone.</p>
                {newRoom && (
                  <div style={{ background: 'rgba(49,46,129,0.15)', border: '1px solid rgba(217,70,239,0.2)', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontFamily: "'Courier New',monospace", fontSize: '0.82rem', color: '#D946EF' }}>
                    {newRoom}
                  </div>
                )}
                <button onClick={() => startCall(newRoom)} disabled={loading || !newRoom} style={{ width: '100%', padding: '0.65rem', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  {loading ? '...' : `Start in ${LANG_FLAGS[language] || '🌐'} ${LANG_NAMES[language] || language} →`}
                </button>
              </div>

              {/* Join call */}
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', fontFamily: "'Manrope',sans-serif", marginBottom: '0.4rem' }}>Join a call</div>
                <p style={{ fontSize: '0.75rem', color: '#6d758c', marginBottom: '1rem', lineHeight: 1.5 }}>Enter a room code from the person who started the call.</p>
                <input
                  placeholder="Room code..."
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startCall(joinCode)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(64,72,93,0.2)', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#F8FAFC', fontFamily: "'Courier New',monospace", fontSize: '0.82rem', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' as const }}
                />
                <button onClick={() => startCall(joinCode)} disabled={!joinCode.trim() || loading} style={{ width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(64,72,93,0.3)', borderRadius: 8, color: '#dee5ff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  Join bridge →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        <div style={{ background: 'rgba(15,25,48,0.7)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 16, padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#6d758c' }}>Recent bridges</div>
            <span style={{ fontSize: '0.72rem', color: '#6d758c' }}>{recent.length} sessions this month</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr) auto', gap: '0.75rem 1.5rem', marginBottom: '0.5rem' }}>
            {['Partner','Language','Duration','Date',''].map(h => (
              <div key={h} style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#40485d' }}>{h}</div>
            ))}
          </div>
          {recent.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr) auto', gap: '0.75rem 1.5rem', padding: '0.85rem 0', borderTop: '1px solid rgba(64,72,93,0.08)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#D946EF,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff', fontFamily: "'Manrope',sans-serif", flexShrink: 0 }}>{s.partner[0]}</div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', fontFamily: "'Manrope',sans-serif" }}>{s.partner}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#a3aac4' }}>{LANG_FLAGS[s.lang] || '🌐'} {LANG_NAMES[s.lang] || s.lang}</div>
              <div style={{ fontSize: '0.82rem', color: '#a3aac4', fontFamily: "'Courier New',monospace" }}>{s.duration}</div>
              <div style={{ fontSize: '0.78rem', color: '#6d758c' }}>{s.date}</div>
              <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(64,72,93,0.2)', borderRadius: 6, padding: '0.35rem 0.75rem', color: '#a3aac4', fontSize: '0.72rem', fontFamily: "'Manrope',sans-serif", fontWeight: 700, cursor: 'pointer' }}>
                View
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
