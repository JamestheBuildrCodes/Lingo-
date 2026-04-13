'use client'

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  AudioTrack,
  TrackToggle,
  DisconnectButton,
  ParticipantName,
  ConnectionStateToast,
} from '@livekit/components-react'
import { Track, RoomEvent, Room } from 'livekit-client'
import { useState, useCallback } from 'react'

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪',
  it: '🇮🇹', pt: '🇧🇷', ja: '🇯🇵', zh: '🇨🇳',
  ar: '🇸🇦', ko: '🇰🇷',
}

interface Props {
  token: string
  livekitUrl: string
  roomName: string
  displayName: string
  language: string
  onLeave: () => void
}

export default function VideoCall({ token, livekitUrl, roomName, displayName, language, onLeave }: Props) {
  const [connected, setConnected] = useState(false)

  return (
    <div style={styles.wrapper}>
      {/* Blueprint grid */}
      <div style={styles.grid} />

      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        audio={true}
        video={true}
        onConnected={() => setConnected(true)}
        onDisconnected={onLeave}
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <RoomAudioRenderer />
        <ConnectionStateToast />

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logoMini}>
            <div style={styles.logoDot} />
            <span style={styles.logoText}>lingo</span>
          </div>

          <div style={styles.roomBadge}>
            <span style={styles.roomDot} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              {roomName}
            </span>
          </div>

          <div style={styles.myLang}>
            <span style={{ fontSize: 16 }}>{LANG_FLAGS[language] || '🌐'}</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{language.toUpperCase()}</span>
          </div>
        </header>

        {/* Main video grid */}
        <div style={styles.videoArea}>
          <ParticipantGrid />
        </div>

        {/* Translation placeholder banner — lights up in Stage 4 */}
        <div style={styles.translationBanner}>
          <span style={styles.translationDot} />
          <span style={{ fontSize: '0.8rem', color: 'rgba(0,217,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
            AI translation activates in Stage 3 — live captions and voice synthesis coming soon
          </span>
        </div>

        {/* Controls bar */}
        <footer style={styles.controls}>
          <TrackToggle source={Track.Source.Microphone} style={styles.controlBtn}>
            🎤
          </TrackToggle>
          <TrackToggle source={Track.Source.Camera} style={styles.controlBtn}>
            📷
          </TrackToggle>
          <DisconnectButton style={styles.leaveBtn}>
            Leave call
          </DisconnectButton>
          <TrackToggle source={Track.Source.ScreenShare} style={styles.controlBtn}>
            🖥️
          </TrackToggle>
        </footer>
      </LiveKitRoom>
    </div>
  )
}

// ─── Participant Grid ─────────────────────────────────────────────────────────
function ParticipantGrid() {
  const participants = useParticipants()
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
    ],
    { onlySubscribed: false }
  )

  return (
    <div style={{
      ...styles.grid2,
      gridTemplateColumns: participants.length <= 1
        ? '1fr'
        : participants.length <= 4
          ? 'repeat(2, 1fr)'
          : 'repeat(3, 1fr)',
    }}>
      {tracks.map(track => (
        <div key={track.participant.identity} style={styles.participantTile}>
          {track.publication?.isSubscribed || track.participant.isLocal ? (
            <VideoTrack trackRef={track} style={styles.video} />
          ) : (
            <div style={styles.videoPlaceholder}>
              <div style={styles.avatarCircle}>
                {track.participant.name?.[0]?.toUpperCase() || '?'}
              </div>
            </div>
          )}
          <div style={styles.participantLabel}>
            <ParticipantName participant={track.participant} style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'DM Sans',sans-serif", fontSize: '0.8rem' }} />
            {/* Language badge — parsed from participant metadata (set by backend) */}
            <LanguageBadge metadata={track.participant.metadata} />
          </div>
        </div>
      ))}

      {participants.length === 0 && (
        <div style={styles.waitingState}>
          <div style={styles.waitingPulse} />
          <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>
            Waiting for others to join…
          </p>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
            Share the room code to invite someone
          </p>
        </div>
      )}
    </div>
  )
}

function LanguageBadge({ metadata }: { metadata?: string }) {
  if (!metadata) return null
  try {
    const { language } = JSON.parse(metadata)
    const flag = LANG_FLAGS[language]
    if (!flag) return null
    return (
      <span style={styles.langBadge}>
        {flag} {language?.toUpperCase()}
      </span>
    )
  } catch {
    return null
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    background: '#0a1628',
    display: 'flex', flexDirection: 'column',
    position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: 'linear-gradient(rgba(26,86,219,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(26,86,219,0.05) 1px,transparent 1px)',
    backgroundSize: '60px 60px',
  },
  header: {
    position: 'relative', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(10,22,40,0.8)',
    backdropFilter: 'blur(20px)',
  },
  logoMini: { display: 'flex', alignItems: 'center', gap: 8 },
  logoDot: { width: 8, height: 8, borderRadius: '50%', background: '#00d9ff' },
  logoText: {
    fontFamily: "'Syne',sans-serif", fontSize: '1.1rem', fontWeight: 800,
    letterSpacing: '-0.04em', color: '#f0f4ff',
  },
  roomBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 100, padding: '0.35rem 0.9rem',
  },
  roomDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#00d9ff',
    boxShadow: '0 0 6px #00d9ff',
  },
  myLang: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(26,86,219,0.15)',
    border: '1px solid rgba(26,86,219,0.3)',
    borderRadius: 8, padding: '0.35rem 0.75rem',
  },
  videoArea: {
    flex: 1, position: 'relative', zIndex: 1,
    padding: '1rem',
    overflow: 'hidden',
  },
  grid2: {
    display: 'grid',
    gap: '0.75rem',
    height: '100%',
  },
  participantTile: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    background: '#0f2040',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  video: {
    width: '100%', height: '100%',
    objectFit: 'cover',
  },
  videoPlaceholder: {
    width: '100%', height: '100%', minHeight: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0f2040,#0a1628)',
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'linear-gradient(135deg,#2563eb,#00d9ff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Syne',sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#fff',
  },
  participantLabel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '0.5rem 0.75rem',
    background: 'linear-gradient(transparent,rgba(10,22,40,0.85))',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  langBadge: {
    fontSize: '0.7rem',
    background: 'rgba(26,86,219,0.4)',
    border: '1px solid rgba(26,86,219,0.4)',
    borderRadius: 4, padding: '0.15rem 0.45rem',
    color: '#f0f4ff',
    fontFamily: "'DM Sans',sans-serif",
  },
  waitingState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 300,
  },
  waitingPulse: {
    width: 48, height: 48, borderRadius: '50%',
    border: '2px solid rgba(0,217,255,0.3)',
    borderTopColor: '#00d9ff',
    animation: 'spin 1.5s linear infinite',
  },
  translationBanner: {
    position: 'relative', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: '0.6rem',
    background: 'rgba(0,217,255,0.04)',
    borderTop: '1px solid rgba(0,217,255,0.1)',
    borderBottom: '1px solid rgba(0,217,255,0.1)',
  },
  translationDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(0,217,255,0.3)',
  },
  controls: {
    position: 'relative', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
    padding: '1rem 1.5rem',
    background: 'rgba(10,22,40,0.9)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
  },
  controlBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.65rem 1.2rem',
    color: '#f0f4ff', fontSize: '0.88rem',
    fontFamily: "'DM Sans',sans-serif",
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  leaveBtn: {
    background: 'rgba(220,38,38,0.2)',
    border: '1px solid rgba(220,38,38,0.4)',
    borderRadius: 10, padding: '0.65rem 1.6rem',
    color: '#fca5a5', fontSize: '0.88rem',
    fontFamily: "'DM Sans',sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}
