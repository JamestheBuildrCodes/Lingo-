'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import VideoCall from '@/components/VideoCall'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomName = decodeURIComponent(params.roomName as string)

  const [token, setToken]           = useState<string | null>(null)
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [language, setLanguage]     = useState('en')
  const [ready, setReady]           = useState(false)

  useEffect(() => {
    const t  = sessionStorage.getItem('lingo_token')
    const u  = sessionStorage.getItem('lingo_livekit_url')
    const n  = sessionStorage.getItem('lingo_display_name')
    const lg = sessionStorage.getItem('lingo_language')

    if (!t || !u) {
      // No token — redirect back to home to get one
      router.replace('/')
      return
    }
    setToken(t)
    setLivekitUrl(u)
    setDisplayName(n || 'Guest')
    setLanguage(lg || 'en')
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#00d9ff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  return (
    <VideoCall
      token={token!}
      livekitUrl={livekitUrl!}
      roomName={roomName}
      displayName={displayName}
      language={language}
      onLeave={() => {
        sessionStorage.clear()
        router.replace('/')
      }}
    />
  )
}
