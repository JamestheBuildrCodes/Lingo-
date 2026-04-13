'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

// ─── Language data ────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧', region: 'Global'      },
  { code: 'zh', label: 'Mandarin',   flag: '🇨🇳', region: 'Asia'        },
  { code: 'fr', label: 'French',     flag: '🇫🇷', region: 'Europe'      },
  { code: 'yo', label: 'Yoruba',     flag: '🇳🇬', region: 'Africa'      },
  { code: 'ig', label: 'Igbo',       flag: '🇳🇬', region: 'Africa'      },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦', region: 'Middle East' },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸', region: 'Europe'      },
  { code: 'de', label: 'German',     flag: '🇩🇪', region: 'Europe'      },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷', region: 'Americas'    },
  { code: 'ja', label: 'Japanese',   flag: '🇯🇵', region: 'Asia'        },
  { code: 'ko', label: 'Korean',     flag: '🇰🇷', region: 'Asia'        },
  { code: 'sw', label: 'Swahili',    flag: '🇰🇪', region: 'Africa'      },
]

// Active trade corridors (for the live corridor map)
const CORRIDORS = [
  { from: '🇳🇬 Lagos',         to: '🇨🇳 Guangzhou',   lang: 'yo↔zh', active: true  },
  { from: '🇳🇬 Abuja',         to: '🇬🇧 London',      lang: 'en↔en', active: true  },
  { from: '🇰🇪 Nairobi',       to: '🇨🇳 Shenzhen',    lang: 'sw↔zh', active: false },
  { from: '🇬🇭 Accra',         to: '🇩🇪 Berlin',      lang: 'en↔de', active: true  },
  { from: '🇮🇳 Mumbai',        to: '🇦🇪 Dubai',       lang: 'hi↔ar', active: false },
  { from: '🇳🇬 Port Harcourt', to: '🇫🇷 Paris',       lang: 'en↔fr', active: true  },
  { from: '🇹🇷 Istanbul',      to: '🇳🇬 Lagos',       lang: 'tr↔yo', active: false },
  { from: '🇿🇦 Johannesburg',  to: '🇨🇳 Beijing',     lang: 'en↔zh', active: true  },
]

const FEATURES = [
  { icon: '⚡', title: 'Sub-second latency',      desc: 'Translation begins mid-sentence. You hear the answer before you finish asking the question.' },
  { icon: '🌍', title: '120+ languages',           desc: 'Including Yoruba, Igbo, Swahili and Mandarin. The Africa-Asia corridor is our home turf.'  },
  { icon: '🔒', title: 'End-to-end encrypted',     desc: 'AES-256 on every audio stream. Your trade negotiations stay yours.'                         },
  { icon: '🎙️', title: 'Voice + captions',         desc: 'Hear the translation and read it simultaneously. Perfect for noisy trade floors.'            },
  { icon: '🤖', title: 'Trade-term aware',          desc: 'FOB, CIF, MOQ, Incoterms — correctly translated where Google Translate fails.'             },
  { icon: '📱', title: 'No download required',     desc: 'Works in any browser. Share a link, join instantly. No installs, no accounts needed.'       },
]

const STEPS = [
  { num: '01', title: 'Select your language',   desc: 'Pick from 120+ languages. Lingo auto-detects your region and pre-selects the best match.' },
  { num: '02', title: 'Share your bridge code', desc: 'One link. The other person opens it, selects their language, and joins instantly.'         },
  { num: '03', title: 'Speak naturally',         desc: 'Talk at normal pace. Captions appear in under 0.4 seconds in both languages.'             },
  { num: '04', title: 'Close the deal',          desc: "No misunderstandings. No interpreter fees. Just two people who understand each other."     },
]

const TESTIMONIALS = [
  { name: 'Amara Eze',      role: 'Importer · Lagos',       text: 'I used to spend ₦80,000 per supplier call on interpreters. With Lingo I had a 45-minute negotiation with my Shenzhen supplier for ₦3,000. Deal closed same day.', flag: '🇳🇬' },
  { name: 'Kojo Tunde',     role: 'Sourcing Agent · Accra', text: 'The trade term translation is what sold me. FOB Guangzhou terms correctly translated to my Igbo-speaking client. Google Translate cannot do this.', flag: '🇬🇭'             },
  { name: 'Isabella Silva', role: 'HR Director · São Paulo', text: 'We interviewed 12 international candidates in one morning without a single interpreter. The HR use case alone justifies the Starter plan.',          flag: '🇧🇷'             },
]

const FAQS = [
  { q: 'Does Lingo work without an internet connection?', a: 'No — Lingo requires internet for the AI translation pipeline. However, it works on 3G and above, so mobile data is fine.' },
  { q: 'How accurate is the translation?',               a: 'For major language pairs, 99%+ accuracy on business vocabulary. For African languages (Yoruba, Igbo, Swahili), we use Meta\'s NLLB-200 model which is built specifically for low-resource languages.' },
  { q: 'Can I use Lingo for group calls?',               a: 'Yes — up to 10 participants, each speaking a different language. Each person hears and reads captions in their own language.' },
  { q: 'Is my audio stored?',                            a: 'No. Audio is processed in real time and discarded immediately. Transcripts are optionally saved for Starter plan users who enable it.' },
  { q: 'What is the free plan?',                         a: '30 minutes per month, forever. No credit card required. Upgrade to Starter (₦5,000/month) for 400 minutes and all language pairs.' },
  { q: 'Does Lingo work in China?',                      a: 'The Nigeria-China corridor uses a China-compatible stack hosted in AWS Singapore — no Google or OpenAI services, fully accessible from mainland China.' },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [liveCount, setLiveCount] = useState(47)
  const [activeCorridor, setActiveCorridor] = useState(0)
  const [demoLine, setDemoLine]   = useState(0)

  const demoLines = [
    { speaker: 'Amara',    lang: 'EN', flag: '🇳🇬', text: '"What is your MOQ for the Ankara fabric?"',         color: '#f382ff' },
    { speaker: 'Wei Zhang',lang: 'ZH', flag: '🇨🇳', text: '"最低起订量是500米，FOB价格含清关费用。"',              color: '#ff8439' },
    { speaker: 'Wei Zhang',lang: '→EN',flag: '🇬🇧', text: '"MOQ is 500 meters, FOB price includes clearance."', color: '#ff8439', translated: true },
    { speaker: 'Amara',    lang: 'EN', flag: '🇳🇬', text: '"When can you ship? We need it before Friday."',      color: '#f382ff' },
    { speaker: 'Wei Zhang',lang: 'ZH', flag: '🇨🇳', text: '"我们可以在周三出货，请确认您的地址。"',               color: '#ff8439' },
    { speaker: 'Wei Zhang',lang: '→EN',flag: '🇬🇧', text: '"We can ship Wednesday. Please confirm your address."',color: '#ff8439', translated: true },
  ]

  useEffect(() => {
    const t = setInterval(() => {
      setDemoLine(i => (i + 1) % demoLines.length)
    }, 2600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(n => n + Math.floor(Math.random() * 3) - 1)
      setActiveCorridor(i => (i + 1) % CORRIDORS.length)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: '#060e20', color: '#dee5ff', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '7rem 2rem 4rem' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(49,46,129,0.15)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(217,70,239,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px,rgba(25,37,64,0.7) 1px,transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(25,37,64,0.6)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff8439', boxShadow: '0 0 8px #ff8439', display: 'inline-block' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#a3aac4' }}>
                {liveCount} bridges active right now
              </span>
            </div>

            <h1 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: 'clamp(2.8rem,5vw,4.5rem)', lineHeight: 1.04, letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '1.2rem' }}>
              The platform that<br />
              <span style={{ background: 'linear-gradient(90deg,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                makes Zoom irrelevant
              </span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#a3aac4', lineHeight: 1.75, maxWidth: 480, marginBottom: '2rem' }}>
              Zoom lets you talk. Lingo lets you <em>understand</em>. Real-time AI voice translation for every call — built for the Africa-Asia-Europe trade corridor.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '3rem' }}>
              <Link href="/auth?mode=signup" style={{ padding: '0.95rem 2rem', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', borderRadius: 10, color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 0 30px rgba(217,70,239,0.3)' }}>
                Start Free — No Card Needed →
              </Link>
              <a href="#demo" style={{ padding: '0.95rem 1.8rem', background: 'none', border: '1px solid rgba(64,72,93,0.3)', borderRadius: 10, color: '#a3aac4', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                ▶ Watch demo
              </a>
            </div>

            <div style={{ display: 'flex', gap: '2.5rem' }}>
              {[['0.4s','Avg latency'],['120+','Languages'],['₦0','To start']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.04em', background: 'linear-gradient(90deg,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6d758c', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live demo card */}
          <div>
            <div id="demo" style={{ background: 'rgba(15,25,48,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 0 80px rgba(217,70,239,0.07)' }}>
              {/* Demo header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(64,72,93,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff8439', boxShadow: '0 0 6px #ff8439', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: '#ff8439' }}>LIVE BRIDGE</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#6d758c', fontFamily: "'Courier New',monospace" }}>Yoruba ⇆ Mandarin</span>
              </div>

              {/* Participants */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(64,72,93,0.08)' }}>
                {[{name:'Amara Eze',lang:'Yoruba',flag:'🇳🇬',c:'#f382ff'},{name:'Wei Zhang',lang:'Mandarin',flag:'🇨🇳',c:'#ff8439'}].map(p => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${p.c}22`, border: `2px solid ${p.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: p.c, fontFamily: "'Manrope',sans-serif" }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F8FAFC', fontFamily: "'Manrope',sans-serif" }}>{p.name}</div>
                      <div style={{ fontSize: '0.62rem', color: '#a3aac4' }}>{p.flag} {p.lang}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live captions */}
              <div style={{ padding: '1.25rem 1.5rem', minHeight: 180 }}>
                {demoLines.slice(0, demoLine + 1).slice(-3).map((line, i) => (
                  <div key={i} style={{ marginBottom: '0.75rem', display: 'flex', gap: 10, alignItems: 'flex-start', opacity: i < 2 ? 0.5 : 1, transition: 'opacity 0.5s' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{line.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: line.color }}>{line.speaker}</span>
                        <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem', background: 'rgba(255,255,255,0.06)', borderRadius: 4, color: '#a3aac4' }}>{line.lang}</span>
                        {line.translated && <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem', background: 'rgba(255,132,57,0.12)', borderRadius: 4, color: '#ff8439', fontStyle: 'italic' }}>translated</span>}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#dee5ff', margin: 0, lineHeight: 1.5, fontStyle: line.translated ? 'normal' : 'italic' }}>{line.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo footer */}
              <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#6d758c', fontFamily: "'Courier New',monospace" }}>Latency: 38ms</span>
                <span style={{ fontSize: '0.65rem', color: '#6d758c' }}>🔒 AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '6rem 2rem', borderTop: '1px solid rgba(64,72,93,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel>Why Lingo beats Zoom</SectionLabel>
          <h2 style={sectionTitle}>Built different. <GradSpan>Translates differently.</GradSpan></h2>
          <p style={sectionSub}>Every feature exists for one reason: to let any two humans understand each other on a live call, instantly.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5px', background: 'rgba(64,72,93,0.15)', borderRadius: 16, overflow: 'hidden', marginTop: '3rem' }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ background: '#060e20', padding: '2.5rem', transition: 'background 0.3s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0f1930')}
                onMouseLeave={e => (e.currentTarget.style.background = '#060e20')}>
                <div style={{ fontSize: 32, marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem', color: '#F8FAFC' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#a3aac4', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how" style={{ padding: '6rem 2rem', background: 'rgba(9,19,40,0.5)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel>How it works</SectionLabel>
          <h2 style={sectionTitle}>Four steps to your <GradSpan>first bridge</GradSpan></h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', marginTop: '3rem' }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 20, left: '60%', right: '-10%', height: 1, background: 'linear-gradient(90deg,rgba(217,70,239,0.4),transparent)', zIndex: 0 }} />
                )}
                <div style={{ background: 'rgba(49,46,129,0.15)', border: '1px solid rgba(217,70,239,0.2)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '0.85rem', color: '#D946EF', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
                  {step.num}
                </div>
                <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#F8FAFC', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#a3aac4', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE CORRIDOR MAP (THE COOL THING) ────────────────────────── */}
      <section id="corridors" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel>Live network</SectionLabel>
          <h2 style={sectionTitle}>Active corridors <GradSpan>right now</GradSpan></h2>
          <p style={sectionSub}>Every dot is a real active bridge. The Africa-Asia-Europe triangle is the most underserved and fastest-growing trade corridor in the world. Lingo owns it.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginTop: '3rem', maxWidth: 800, margin: '3rem auto 0' }}>
            {CORRIDORS.map((c, i) => (
              <div key={i} style={{ background: i === activeCorridor ? 'rgba(49,46,129,0.2)' : 'rgba(9,19,40,0.5)', border: `1px solid ${i === activeCorridor ? 'rgba(217,70,239,0.4)' : 'rgba(64,72,93,0.15)'}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.4s' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.active ? '#ff8439' : '#40485d', boxShadow: c.active ? '0 0 8px #ff8439' : 'none', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F8FAFC', fontFamily: "'Manrope',sans-serif" }}>
                    {c.from} <span style={{ color: '#D946EF' }}>⇆</span> {c.to}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#6d758c', marginTop: 2 }}>{c.lang}</div>
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: c.active ? '#ff8439' : '#40485d' }}>
                  {c.active ? 'LIVE' : 'STANDBY'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'rgba(9,19,40,0.5)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel>Social proof</SectionLabel>
          <h2 style={sectionTitle}>Traders who <GradSpan>closed deals</GradSpan></h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginTop: '3rem' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: 'rgba(6,14,32,0.7)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 16, padding: '2rem', position: 'relative', transition: 'transform 0.3s, border-color 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(217,70,239,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(64,72,93,0.15)' }}>
                <div style={{ position: 'absolute', top: 12, left: 16, fontSize: '4rem', color: 'rgba(49,46,129,0.2)', fontFamily: 'serif', lineHeight: 1 }}>"</div>
                <p style={{ fontSize: '0.88rem', color: '#a3aac4', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#312E81,#D946EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff', fontFamily: "'Manrope',sans-serif" }}>
                    {t.flag}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#F8FAFC' }}>{t.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6d758c' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel>Pricing</SectionLabel>
          <h2 style={sectionTitle}>Cheaper than <GradSpan>one interpreter hour</GradSpan></h2>
          <p style={sectionSub}>An interpreter costs ₦80,000/hour. Lingo costs ₦5,000/month for 400 minutes.</p>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/pricing" style={{ color: '#D946EF', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.9rem' }}>
              See full pricing details →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
            {[
              { tier: 'Free', price: '₦0', period: '/month', note: '30 minutes forever', features: ['30 min/month','1-to-1 audio calls','3 language pairs','Live captions'], cta: 'Start Free', href: '/auth?mode=signup', featured: false },
              { tier: 'Starter', price: '₦5,000', period: '/month', note: '~$3.50 · Less than 1 interpreter call', features: ['400 min/month','All 120+ languages','Priority servers','Caption history','Trade-term glossary'], cta: 'Get Starter →', href: '/auth?mode=signup', featured: true },
              { tier: 'Trade-Pass', price: '₦70', period: '/minute', note: 'No subscription', features: ['Pay per call','No commitment','Full translation quality','Perfect for one-off deals'], cta: 'Buy Credits', href: '/pricing', featured: false },
            ].map(p => (
              <div key={p.tier} style={{ background: '#060e20', border: p.featured ? '1px solid rgba(217,70,239,0.4)' : '1px solid rgba(64,72,93,0.15)', borderRadius: 16, padding: '2rem', position: 'relative', boxShadow: p.featured ? '0 0 40px rgba(217,70,239,0.08)' : 'none' }}>
                {p.featured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', padding: '0.25rem 1rem', borderRadius: 9999, fontSize: '0.62rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const }}>MOST POPULAR</div>}
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#a3aac4', marginBottom: '0.75rem' }}>{p.tier}</div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '2.2rem', color: p.featured ? '#D946EF' : '#F8FAFC', letterSpacing: '-0.04em' }}>{p.price}</span>
                  <span style={{ color: '#6d758c', fontSize: '0.85rem' }}>{p.period}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6d758c', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(64,72,93,0.12)' }}>{p.note}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: '#dee5ff', alignItems: 'flex-start' }}>
                      <span style={{ color: '#ff8439', flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} style={{ display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: 10, background: p.featured ? 'linear-gradient(45deg,#312E81,#D946EF,#F97316)' : 'rgba(255,255,255,0.06)', border: p.featured ? 'none' : '1px solid rgba(64,72,93,0.3)', color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'rgba(9,19,40,0.5)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>Questions <GradSpan>answered</GradSpan></h2>
          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg,rgba(49,46,129,0.3),rgba(217,70,239,0.1),rgba(249,115,22,0.08))', border: '1px solid rgba(64,72,93,0.15)', borderRadius: '1.5rem', padding: '5rem 3rem' }}>
          <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '1rem' }}>
            Your next trade deal<br />starts with one call.
          </h2>
          <p style={{ color: '#a3aac4', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
            Join traders across Africa, Asia, and Europe who use Lingo to close deals without language barriers.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <Link href="/auth?mode=signup" style={{ padding: '1rem 2.5rem', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', borderRadius: 10, color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 0 30px rgba(217,70,239,0.3)' }}>
              Start Free — 30 Minutes Included →
            </Link>
            <Link href="/pricing" style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(64,72,93,0.3)', borderRadius: 10, color: '#dee5ff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(64,72,93,0.1)', padding: '3.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '1.2rem', background: 'linear-gradient(90deg,#312E81,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>lingo!</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6d758c', lineHeight: 1.7, maxWidth: 220 }}>Real-time AI translation for the global trade floor. Built by Mastr Buildr, Port Harcourt.</p>
              <a href="https://mastrbuildr.netlify.app" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.75rem', color: '#a3aac4', textDecoration: 'none' }}>Built by Mastr Buildr ↗</a>
            </div>
            {[
              { title: 'Product', links: [['Features','/#features'],['Pricing','/pricing'],['How it works','/#how'],['Corridors','/#corridors']] },
              { title: 'Account', links: [['Sign in','/auth'],['Sign up','/auth?mode=signup'],['Dashboard','/dashboard']] },
              { title: 'Company', links: [['Privacy Policy','#'],['Terms of Service','#'],['Security','#'],['Status','#']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#dee5ff', marginBottom: '1rem', fontFamily: "'Manrope',sans-serif" }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontSize: '0.82rem', color: '#6d758c', textDecoration: 'none', transition: 'color 0.2s' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(64,72,93,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#40485d' }}>© 2025 Lingo! by Mastr Buildr. All rights reserved.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(9,19,40,0.5)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 9999, padding: '0.3rem 0.75rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ fontSize: '0.7rem', color: '#a3aac4' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Small reusable components ────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
      <div style={{ width: 24, height: 1, background: '#D946EF' }} />
      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#6d758c' }}>{children}</span>
    </div>
  )
}
function GradSpan({ children }: { children: React.ReactNode }) {
  return <span style={{ background: 'linear-gradient(90deg,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{children}</span>
}
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'rgba(6,14,32,0.7)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
      <div style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#F8FAFC' }}>{q}</span>
        <span style={{ color: '#D946EF', fontSize: '1.2rem', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
      </div>
      {open && <div style={{ padding: '0 1.5rem 1.1rem', fontSize: '0.85rem', color: '#a3aac4', lineHeight: 1.7 }}>{a}</div>}
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Manrope',sans-serif", fontWeight: 900,
  fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', letterSpacing: '-0.04em',
  lineHeight: 1.1, color: '#F8FAFC', marginBottom: '0.75rem',
}
const sectionSub: React.CSSProperties = {
  color: '#a3aac4', fontSize: '1rem', lineHeight: 1.75,
  maxWidth: 540, marginBottom: '0',
}
