'use client'

/**
 * CaptionOverlay — Stage 3
 * ─────────────────────────
 * Stage 2: showed captions in the SPEAKER's language for everyone.
 * Stage 3: each listener sees captions in THEIR OWN language.
 *
 * How it works:
 *   - The agent broadcasts a message with:
 *       text: original transcript (speaker's language)
 *       translations: { "en": "...", "fr": "...", "zh": "..." }
 *       target_identities: ["wei-xyz789", "amara-abc123"]
 *
 *   - This component receives myLanguage (the local participant's language)
 *     and myIdentity as props.
 *
 *   - For captions from OTHER speakers:
 *       → if translations[myLanguage] exists, show that
 *       → otherwise fall back to original text
 *
 *   - For your OWN speech:
 *       → always show original text (you're hearing yourself)
 *
 *   - Partial transcripts: shown immediately in original language
 *     (no translation API call, too fast)
 *   - Final transcripts: show translated version once it arrives
 */

import { useEffect, useRef, useState } from 'react'
import { useDataChannel, useLocalParticipant } from '@livekit/components-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgentMessage {
  type: 'transcript'
  identity: string
  name: string
  language: string
  text: string
  is_final: boolean
  translations?: Record<string, string>   // { "en": "...", "fr": "..." }
  target_identities?: string[]
}

interface CaptionLine {
  id: string
  identity: string
  name: string
  speakerLang: string
  originalText: string
  displayText: string       // what this listener actually reads
  isTranslated: boolean     // true if displayText is a translation
  isMine: boolean           // true if I am the speaker
  is_final: boolean
  timestamp: number
}

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧', fr: '🇫🇷', zh: '🇨🇳', es: '🇪🇸',
  de: '🇩🇪', ar: '🇸🇦', yo: '🇳🇬', ig: '🇳🇬',
  pt: '🇧🇷', ja: '🇯🇵', ko: '🇰🇷',
}

const LINGER_MS = 7000   // how long a final caption stays visible

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  myLanguage: string   // the local participant's language code e.g. "en"
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CaptionOverlay({ myLanguage }: Props) {
  const { localParticipant } = useLocalParticipant()
  const myIdentity = localParticipant?.identity ?? ''

  const [history, setHistory]   = useState<CaptionLine[]>([])
  const [partials, setPartials] = useState<Record<string, CaptionLine>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const { message } = useDataChannel()

  useEffect(() => {
    if (!message?.payload) return

    let event: AgentMessage
    try {
      event = JSON.parse(new TextDecoder().decode(message.payload))
    } catch { return }

    if (event.type !== 'transcript' || !event.text?.trim()) return

    const isMine = event.identity === myIdentity

    // What text does THIS listener see?
    let displayText = event.text
    let isTranslated = false

    if (!isMine && event.is_final) {
      // Check if there's a translation for my language
      const translated = event.translations?.[myLanguage]
      if (translated && translated !== event.text) {
        displayText = translated
        isTranslated = true
      }
    }

    const line: CaptionLine = {
      id: `${event.identity}-${Date.now()}`,
      identity: event.identity,
      name: event.name,
      speakerLang: event.language,
      originalText: event.text,
      displayText,
      isTranslated,
      isMine,
      is_final: event.is_final,
      timestamp: Date.now(),
    }

    if (event.is_final) {
      setHistory(prev => [...prev.slice(-25), line])
      setPartials(prev => {
        const next = { ...prev }
        delete next[event.identity]
        return next
      })
    } else {
      // For partials, always show original (translation not available yet)
      setPartials(prev => ({ ...prev, [event.identity]: { ...line, is_final: false } }))
    }
  }, [message, myLanguage, myIdentity])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, partials])

  // Expire old captions
  useEffect(() => {
    const t = setInterval(() => {
      const cutoff = Date.now() - LINGER_MS
      setHistory(prev => prev.filter(l => l.timestamp > cutoff))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const allPartials = Object.values(partials)
  const hasContent  = history.length > 0 || allPartials.length > 0

  if (!hasContent) {
    return (
      <div style={s.empty}>
        <span style={s.emptyDot} />
        <span style={s.emptyText}>
          {myLanguage !== 'en'
            ? `Captions will appear in ${LANG_FLAGS[myLanguage] ?? ''} your language`
            : 'Captions will appear as people speak'}
        </span>
      </div>
    )
  }

  return (
    <div style={s.overlay} ref={scrollRef}>
      {history.map(line => (
        <CaptionBubble key={line.id} line={line} myLanguage={myLanguage} />
      ))}
      {allPartials.map(line => (
        <CaptionBubble key={`partial-${line.identity}`} line={line} myLanguage={myLanguage} isPartial />
      ))}
    </div>
  )
}

// ─── Caption bubble ───────────────────────────────────────────────────────────
function CaptionBubble({
  line,
  myLanguage,
  isPartial = false,
}: {
  line: CaptionLine
  myLanguage: string
  isPartial?: boolean
}) {
  const flag = LANG_FLAGS[line.speakerLang] ?? '🌐'
  const initials = line.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={s.row}>
      {/* Avatar */}
      <div style={{
        ...s.avatar,
        background: line.isMine
          ? 'linear-gradient(135deg,#312E81,#D946EF)'
          : 'linear-gradient(135deg,#D946EF,#F97316)',
      }}>
        {initials}
      </div>

      {/* Bubble */}
      <div style={{
        ...s.bubble,
        ...(isPartial   ? s.bubblePartial   : {}),
        ...(line.isMine ? s.bubbleMine      : {}),
      }}>
        {/* Header row */}
        <div style={s.header}>
          <span style={s.name}>{line.name}</span>
          <span style={s.langTag}>{flag} {line.speakerLang.toUpperCase()}</span>

          {/* Translation badge — shows when caption is translated */}
          {line.isTranslated && !isPartial && (
            <span style={s.translatedBadge}>
              → {LANG_FLAGS[myLanguage] ?? ''} translated
            </span>
          )}

          {isPartial && (
            <span style={s.speakingBadge}>speaking…</span>
          )}
        </div>

        {/* Caption text */}
        <p style={{
          ...s.text,
          ...(isPartial ? s.textPartial : {}),
        }}>
          {line.displayText}
        </p>

        {/* Original text shown beneath translation (for reference) */}
        {line.isTranslated && !isPartial && line.originalText !== line.displayText && (
          <p style={s.original}>
            {line.originalText}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  overlay: {
    width: '100%',
    maxHeight: 300,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.75rem',
    scrollbarWidth: 'none',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '1.2rem',
    opacity: 0.4,
  },
  emptyDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(217,70,239,0.5)',
    display: 'inline-block',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: 'rgba(163,170,196,0.8)',
    fontFamily: "'Inter',sans-serif",
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.6rem', fontWeight: 800,
    color: '#fff', fontFamily: "'Manrope',sans-serif",
    flexShrink: 0, marginTop: 2,
  },
  bubble: {
    flex: 1,
    borderRadius: '0 0.75rem 0.75rem 0.75rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(9,19,40,0.7)',
    border: '1px solid rgba(64,72,93,0.2)',
    maxWidth: '88%',
  },
  bubblePartial: {
    background: 'rgba(49,46,129,0.12)',
    border: '1px solid rgba(217,70,239,0.15)',
  },
  bubbleMine: {
    background: 'rgba(25,37,64,0.5)',
    border: '1px solid rgba(64,72,93,0.15)',
  },
  header: {
    display: 'flex', alignItems: 'center',
    gap: 6, marginBottom: 4, flexWrap: 'wrap' as const,
  },
  name: {
    fontSize: '0.7rem', fontWeight: 700,
    color: '#F8FAFC', fontFamily: "'Manrope',sans-serif",
  },
  langTag: {
    fontSize: '0.6rem', padding: '0.1rem 0.35rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(64,72,93,0.15)',
    borderRadius: 4, color: '#a3aac4',
    fontFamily: "'Inter',sans-serif",
  },
  translatedBadge: {
    fontSize: '0.6rem', padding: '0.1rem 0.4rem',
    background: 'rgba(249,115,22,0.12)',
    border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: 4, color: '#ff8439',
    fontFamily: "'Inter',sans-serif",
    fontStyle: 'italic',
  },
  speakingBadge: {
    fontSize: '0.6rem', color: 'rgba(217,70,239,0.6)',
    fontFamily: "'Inter',sans-serif", fontStyle: 'italic',
  },
  text: {
    fontSize: '0.88rem', color: '#dee5ff',
    lineHeight: 1.55, margin: 0,
    fontFamily: "'Inter',sans-serif",
  },
  textPartial: {
    color: 'rgba(222,229,255,0.6)', fontStyle: 'italic',
  },
  original: {
    fontSize: '0.75rem', color: 'rgba(163,170,196,0.5)',
    lineHeight: 1.4, margin: '4px 0 0',
    fontFamily: "'Inter',sans-serif",
    borderTop: '1px solid rgba(64,72,93,0.1)',
    paddingTop: 4,
  },
}
