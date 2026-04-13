'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AudioCall from '@/components/AudioCall'

export default function RoomPage() {
  const params   = useParams()
  const router   = useRouter()
  const roomName = decodeURIComponent(params.roomName as string)

  const [token, setToken]       = useState<string | null>(null)
  const [url, setUrl]           = useState<string | null>(null)
  const [displayName, setName]  = useState('')
  const [language, setLang]     = useState('en')
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    const t  = sessionStorage.getItem('lingo_token')
    const u  = sessionStorage.getItem('lingo_livekit_url')
    const n  = sessionStorage.getItem('lingo_display_name')
    const lg = sessionStorage.getItem('lingo_language')

    if (!t || !u) { router.replace('/auth'); return }

    setToken(t); setUrl(u)
    setName(n || 'Guest')
    setLang(lg || 'en')
    setReady(true)
  }, [router])

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: '#060e20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#D946EF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <AudioCall
      token={token!}
      livekitUrl={url!}
      roomName={roomName}
      displayName={displayName}
      language={language}
      onLeave={() => {
        sessionStorage.removeItem('lingo_token')
        sessionStorage.removeItem('lingo_livekit_url')
        router.replace('/dashboard')
      }}
    />
  )
}
