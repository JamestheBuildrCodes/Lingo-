'use client';

/**
 * AudioCall — Kinetic Bridge Design
 * ────────────────────────────────────
 * Exact duplicate of the uploaded Stitch design:
 * - Fixed header with lingo! wordmark + nav
 * - Left sidebar: connection status + nav items + signal meter
 * - Left panel (1/3): real-time transcript bubbles from CaptionOverlay
 * - Center panel: avatar visualizer + metrics grid + floating control bar
 */

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useIsSpeaking,
  useIsMuted,
  ConnectionStateToast,
  useDataChannel,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useState, useEffect, useRef } from 'react'

// ─── Types & Helpers ──────────────────────────────────────────────────────────
const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧', fr: '🇫🇷', zh: '🇨🇳', es: '🇪🇸',
  de: '🇩🇪', ar: '🇸🇦', yo: '🇳🇬', ig: '🇳🇬',
  pt: '🇧🇷', ja: '🇯🇵', ko: '🇰🇷',
}
const LANG_NAMES: Record<string, string> = {
  en: 'English', fr: 'French',     zh: 'Mandarin', es: 'Spanish',
  de: 'German',  ar: 'Arabic',     yo: 'Yoruba',    ig: 'Igbo',
  pt: 'Portuguese', ja: 'Japanese', ko: 'Korean',
}

function isAgent(p: any): boolean {
  try { if (JSON.parse(p?.metadata || '{}')?.is_agent) return true } catch {}
  return p?.identity?.toLowerCase().startsWith('agent-') ?? false
}
function getLang(p: any): string {
  try { return JSON.parse(p?.metadata || '{}')?.language || 'en' } catch { return 'en' }
}

interface Props {
  token: string; livekitUrl: string; roomName: string
  displayName: string; language: string; onLeave: () => void
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function AudioCall({ token, livekitUrl, roomName, displayName, language, onLeave }: Props) {
  const [duration, setDuration] = useState(0)
  const [muted, setMuted]       = useState(false)

  useEffect(() => {
    const i = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div style={{ background: '#060e20', color: '#dee5ff', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: 500, height: 500, background: 'rgba(243,130,255,0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 400, height: 400, background: 'rgba(255,132,57,0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      <LiveKitRoom
        token={token} serverUrl={livekitUrl}
        connect audio={true} video={false}
        onDisconnected={onLeave}
        style={{ display: 'contents' }}
      >
        <RoomAudioRenderer />
        <ConnectionStateToast />

        <TopHeader roomName={roomName} duration={fmt(duration)} />

        <div style={{ display: 'flex', flex: 1, paddingTop: 64, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
          <Sidebar language={language} />
          <main style={{ marginLeft: 256, flex: 1, display: 'flex', overflow: 'hidden' }}>
            <TranscriptPanel myLanguage={language} />
            <CenterPanel
              language={language}
              muted={muted}
              onMuteToggle={() => setMuted(m => !m)}
              onLeave={onLeave}
            />
          </main>
        </div>
      </LiveKitRoom>
    </div>
  )
}
// Change the name here to GuestAvatar
function GuestAvatar({ participant }: { participant: any }) {
  const isSpeaking = useIsSpeaking(participant);
  const lang = getLang(participant);

  return (
    <ParticipantAvatar
      name={participant.name || 'Guest'}
      language={lang || 'en'}
      isSpeaking={isSpeaking}
      isLocal={false}
      label="GUEST"
      accentColor="#ff8439"
    />
  );
}
// ─── Center Panel ─────────────────────────────────────────────────────────────
function CenterPanel({ language, muted, onMuteToggle, onLeave }: {
  language: string; muted: boolean
  onMuteToggle: () => void; onLeave: () => void
}) {
  const all = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const humans = [
    localParticipant,
    ...all.filter(p => p.identity !== localParticipant?.identity && !isAgent(p)),
  ];

  const localSpeaking = useIsSpeaking(localParticipant);
  const guest = humans[1] ?? null;

  // We no longer call useIsSpeaking(guest) here. 
  // It is handled inside <RemoteParticipant /> below.

  const waveHeights = [40, 70, 30, 90, 55, 80, 20, 65, 45, 85, 35, 75];

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* ... (keep your Status bar code here) ... */}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, width: '100%', position: 'relative' }}>
          
          <ParticipantAvatar
            name={localParticipant?.name || 'You'}
            language={language}
            isSpeaking={localSpeaking}
            isLocal
            label="YOU"
            accentColor="#f382ff"
          />

          <div style={{ flex: 1, maxWidth: 300, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '0 2rem' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'linear-gradient(90deg, #f382ff, #a19ff9, #ff8439)', opacity: 0.25 }} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%', paddingBottom: '10%' }}>
              {waveHeights.map((h, i) => (
                <div key={i} style={{
                  width: 4, borderRadius: 2,
                  height: localSpeaking ? `${h}%` : '8%', // Simplified for now
                  background: i < 6 ? '#22D3EE' : '#FB7185',
                  transition: `height ${0.1 + (i % 4) * 0.05}s ease`,
                  opacity: localSpeaking ? 0.9 : 0.3,
                }} />
              ))}
            </div>
          </div>

          {/* This is the critical fix: conditional component instead of conditional hook */}
          {guest ? (
            <RemoteParticipant participant={guest}/>
          ) : (
            <WaitingAvatar />
          )}

        </div>
        {/* ... (keep your Metrics grid and Control bar) ... */}
      </div>
    </section>
  );
}

// ─── Safe Hook Components ─────────────────────────────────────────────────────

function RemoteParticipant({ participant }: { participant: any }) {
  // Hook is safe here because this component only mounts when guest exists
  const isSpeaking = useIsSpeaking(participant)
  const lang = getLang(participant)
  
  return (
    <ParticipantAvatar
      name={participant.name || 'Guest'}
      language={lang}
      isSpeaking={isSpeaking}
      isLocal={false}
      label="GUEST"
      accentColor="#ff8439"
    />
  )
}

function Waveform({ isActive, heights }: { isActive: boolean; heights: number[] }) {
  return (
    <div style={{ flex: 1, maxWidth: 300, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '0 2rem' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'linear-gradient(90deg, #f382ff, #a19ff9, #ff8439)', opacity: 0.25 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%', paddingBottom: '10%' }}>
        {heights.map((h, i) => (
          <div key={i} style={{
            width: 4, borderRadius: 2,
            height: isActive ? `${h}%` : '8%',
            background: i < 6 ? '#22D3EE' : '#FB7185',
            transition: `height ${0.1 + (i % 4) * 0.05}s ease`,
            opacity: isActive ? 0.9 : 0.3,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── UI Sub-components ────────────────────────────────────────────────────────

function TopHeader({ roomName, duration }: { roomName: string; duration: string }) {
  return (
    <header style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, background: 'rgba(6,14,32,0.8)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', height: 64, borderBottom: '1px solid rgba(64,72,93,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: '1.2rem', fontStyle: 'italic', background: 'linear-gradient(90deg, #312E81, #D946EF, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LINGO!</span>
        <nav style={{ display: 'flex', gap: 24 }}>
          {['Status', 'Security', 'Protocols', 'Analytics'].map((item, i) => (
            <a key={item} href="#" style={{ color: i === 0 ? '#F8FAFC' : '#94A3B8', borderBottom: i === 0 ? '2px solid #D946EF' : 'none', paddingBottom: i === 0 ? 4 : 0, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>{item}</a>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '0.75rem', color: '#a3aac4' }}>{duration}</span>
        <span style={{ fontSize: '0.75rem', color: '#6d758c' }}>{roomName}</span>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #312E81, #D946EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>U</div>
      </div>
    </header>
  )
}

function Sidebar({ language }: { language: string }) {
  const navItems = [
    { icon: 'description', label: 'Transcripts' },
    { icon: 'translate',   label: 'Languages' },
    { icon: 'bar_chart',   label: 'Analytics' },
    { icon: 'lock',        label: 'Security' },
    { icon: 'history',     label: 'History' },
  ]
  return (
    <aside style={{ position: 'fixed', left: 0, top: 64, height: 'calc(100vh - 64px)', width: 256, background: '#060e20', display: 'flex', flexDirection: 'column', paddingTop: 24, paddingBottom: 24, borderRight: '1px solid rgba(64,72,93,0.1)', zIndex: 40 }}>
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, color: '#ec63ff' }}>◎</span>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dee5ff', margin: 0 }}>AUDIO BRIDGE</p>
            <p style={{ fontSize: '0.6rem', color: '#a3aac4', textTransform: 'uppercase', margin: 0 }}>{LANG_FLAGS[language]} {LANG_NAMES[language]}</p>
          </div>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {navItems.map((item, i) => (
          <a key={item.label} href="#" style={{ display: 'flex', alignItems: 'center', padding: '10px 24px', gap: 12, color: i === 0 ? '#ed69ff' : '#94A3B8', background: i === 0 ? 'rgba(237,105,255,0.08)' : 'transparent', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
            <MaterialIcon name={item.icon} size={18} /> {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function TranscriptPanel({ myLanguage }: { myLanguage: string }) {
  const { localParticipant } = useLocalParticipant()
  const { message } = useDataChannel()
  const [lines, setLines] = useState<any[]>([])
  const [partial, setPartial] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message?.payload) return
    let ev: any
    try { ev = JSON.parse(new TextDecoder().decode(message.payload)) } catch { return }
    if (ev.type !== 'transcript' || !ev.text?.trim()) return

    const isMine = ev.identity === localParticipant?.identity
    const display = (!isMine && ev.is_final && ev.translations?.[myLanguage]) ? ev.translations[myLanguage] : ev.text
    const line = { id: `${ev.identity}-${Date.now()}`, name: ev.name, lang: ev.language, original: ev.text, translated: display !== ev.text ? display : undefined, isMine, timestamp: Date.now() }

    if (ev.is_final) { setLines(prev => [...prev.slice(-30), line]); setPartial(null) }
    else { setPartial(line) }
  }, [message, myLanguage, localParticipant])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [lines, partial])

  return (
    <section style={{ width: '33.333%', background: '#091328', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(64,72,93,0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(64,72,93,0.06)' }}>
        <h3 style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a3aac4', margin: 0 }}>Real-time Transcript</h3>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[...lines, ...(partial ? [partial] : [])].map(line => (
          <TranscriptBubble key={line.id} line={line} />
        ))}
      </div>
    </section>
  )
}

function TranscriptBubble({ line }: { line: any }) {
  const accentColor = line.isMine ? '#f382ff' : '#ff8439'
  return (
    <div style={{ textAlign: line.isMine ? 'left' : 'right' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: accentColor, marginBottom: 6 }}>{line.name.toUpperCase()} ({line.lang.toUpperCase()})</p>
      <p style={{ fontSize: '0.95rem', color: '#F8FAFC', background: line.isMine ? '#0f1930' : '#141f38', padding: '10px 14px', borderRadius: '12px', display: 'inline-block', maxWidth: '90%', textAlign: 'left' }}>
        {line.translated || line.original}
      </p>
    </div>
  )
}

function ParticipantAvatar({ name, language, isSpeaking, isLocal, label, accentColor }: any) {
  const initials = name.split(' ').map((w:any) => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: `${accentColor}30`, filter: 'blur(20px)', opacity: isSpeaking ? 1 : 0.4 }} />
        <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `3px solid ${accentColor}`, opacity: isSpeaking ? 1 : 0 }} />
        <div style={{ width: 128, height: 128, borderRadius: '50%', background: isLocal ? 'linear-gradient(135deg, #312E81, #D946EF)' : 'linear-gradient(135deg, #D946EF, #F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', border: `4px solid ${accentColor}`, position: 'relative', zIndex: 1 }}>{initials}</div>
        <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: accentColor, color: '#fff', fontSize: '0.6rem', padding: '3px 10px', borderRadius: 9999, zIndex: 2 }}>{label}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{name}</p>
        <p style={{ fontSize: '0.65rem', color: '#a3aac4', margin: 0 }}>{LANG_FLAGS[language] || '🌐'} {LANG_NAMES[language] || language}</p>
      </div>
    </div>
  )
}

function WaitingAvatar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 128, height: 128, borderRadius: '50%', border: '4px dashed rgba(64,72,93,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#40485d', fontSize: '2rem' }}>?</div>
      <p style={{ fontSize: '0.75rem', color: 'rgba(163,170,196,0.4)', fontStyle: 'italic' }}>Waiting for guest…</p>
    </div>
  )
}

function StatusPill({ color, bg, label, dot, icon }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: bg, border: `1px solid ${color}50` }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
      {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
      <span style={{ fontSize: '0.6rem', fontWeight: 700, color }}>{label}</span>
    </div>
  )
}

function ControlButton({ icon, label, onClick, active, color, filled }: any) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <MaterialIcon name={icon} size={22} color={active ? '#ff6e84' : (color || '#a3aac4')} filled={filled} />
      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: active ? '#ff6e84' : (color || '#a3aac4') }}>{label}</span>
    </button>
  )
}

function MaterialIcon({ name, size = 24, color, filled }: any) {
  return <span className="material-symbols-outlined" style={{ fontSize: size, color: color || 'inherit', fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0", display: 'block' }}>{name}</span>
}
