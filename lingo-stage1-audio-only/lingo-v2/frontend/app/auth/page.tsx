'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'zh', label: 'Mandarin',   flag: '🇨🇳' },
  { code: 'fr', label: 'French',     flag: '🇫🇷' },
  { code: 'yo', label: 'Yoruba',     flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo',       flag: '🇳🇬' },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦' },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸' },
  { code: 'de', label: 'German',     flag: '🇩🇪' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', label: 'Japanese',   flag: '🇯🇵' },
]

function AuthContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode]       = useState<'signin'|'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'signin')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [language, setLang]   = useState('en')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Auto-detect language from browser locale — the cool feature
  useEffect(() => {
    const locale = navigator.language || 'en'
    const code   = locale.split('-')[0].toLowerCase()
    const match  = LANGUAGES.find(l => l.code === code)
    if (match) setLang(match.code)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Please enter your name.')
    setError(''); setLoading(true)

    try {
      // Get a room — for sign-up this is their first room
      // For sign-in, take them to dashboard to choose/join
      if (mode === 'signup') {
        const roomRes = await fetch(`${API_URL}/api/rooms/new`)
        const roomData = await roomRes.json()
        const room = roomData.room_name

        const tokenRes = await fetch(`${API_URL}/api/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_name: room, participant_name: name.trim(), language }),
        })
        if (!tokenRes.ok) throw new Error((await tokenRes.json()).detail || 'Failed')
        const data = await tokenRes.json()

        sessionStorage.setItem('lingo_token',        data.token)
        sessionStorage.setItem('lingo_livekit_url',  data.livekit_url)
        sessionStorage.setItem('lingo_display_name', name.trim())
        sessionStorage.setItem('lingo_language',     language)
        sessionStorage.setItem('lingo_email',        email)
        sessionStorage.setItem('lingo_room',         room)

        router.push('/dashboard')
      } else {
        // Sign in — just store name and go to dashboard
        sessionStorage.setItem('lingo_display_name', name.trim())
        sessionStorage.setItem('lingo_language',     language)
        sessionStorage.setItem('lingo_email',        email)
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.code === language)!

  return (
    <div style={{ minHeight: '100vh', background: '#060e20', color: '#dee5ff', fontFamily: "'Inter',sans-serif", display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Light leaks */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 500, height: 500, background: 'rgba(49,46,129,0.15)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 400, height: 400, background: 'rgba(217,70,239,0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px,rgba(25,37,64,0.7) 1px,transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      {/* Left — branding panel */}
      <div style={{ width: '55%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '3rem' }}>
          <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '1.4rem', fontStyle: 'italic', background: 'linear-gradient(90deg,#312E81,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>lingo!</span>
        </Link>

        <h1 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem,4vw,3.5rem)', lineHeight: 1.05, letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '1.2rem' }}>
          The bridge to<br />
          <span style={{ background: 'linear-gradient(90deg,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>global trade.</span>
        </h1>
        <p style={{ color: '#a3aac4', fontSize: '1rem', lineHeight: 1.75, maxWidth: 420, marginBottom: '3rem' }}>
          Real-time AI translation for every call. Built for the Africa-Asia-Europe trade corridor. No interpreter. No lag. Just understanding.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          {[['4.2M+','Bridges completed'],['190+','Markets connected'],['₦0','To start']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.04em', background: 'linear-gradient(90deg,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
              <div style={{ fontSize: '0.68rem', color: '#6d758c', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 440, background: 'rgba(15,25,48,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: '1.25rem', padding: '2.5rem', boxShadow: '0 0 80px rgba(217,70,239,0.06)' }}>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 4, marginBottom: '2rem' }}>
            {(['signin','signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', background: mode === m ? 'rgba(255,255,255,0.08)' : 'transparent', color: mode === m ? '#F8FAFC' : '#a3aac4', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '0.4rem' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#6d758c', marginBottom: '1.75rem' }}>
            {mode === 'signin' ? 'Sign in to access your bridges and dashboard.' : '30 free minutes every month. No card required.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amara Eze" style={inputStyle} />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} />
            </div>

            {/* Language — auto-detected, shown as info */}
            <div>
              <label style={labelStyle}>
                Your language
                <span style={{ color: '#ff8439', fontStyle: 'italic', marginLeft: 6, fontWeight: 400 }}>auto-detected</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} type="button" onClick={() => setLang(l.code)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '0.5rem 0.2rem',
                    background: language === l.code ? 'rgba(49,46,129,0.3)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${language === l.code ? 'rgba(217,70,239,0.5)' : 'rgba(64,72,93,0.2)'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 18 }}>{l.flag}</span>
                    <span style={{ fontSize: '0.6rem', color: language === l.code ? '#F8FAFC' : '#6d758c', textAlign: 'center' as const }}>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#f87171', fontSize: '0.82rem' }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ padding: '0.9rem', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 0 24px rgba(217,70,239,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> :
                mode === 'signup' ? `Start free in ${selectedLang.flag} ${selectedLang.label} →` : 'Sign in →'}
            </button>

            <p style={{ textAlign: 'center' as const, fontSize: '0.78rem', color: '#40485d' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ background: 'none', border: 'none', color: '#D946EF', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', textDecoration: 'underline' }}>
                {mode === 'signin' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ background: '#060e20', minHeight: '100vh' }} />}>
      <AuthContent />
    </Suspense>
  )
}

const labelStyle: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6d758c', display: 'block', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(0,0,0,0.3)', border: 'none', borderBottom: '2px solid rgba(64,72,93,0.3)', borderRadius: '8px 8px 0 0', color: '#F8FAFC', padding: '0.8rem 1rem', fontSize: '0.92rem', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' }
