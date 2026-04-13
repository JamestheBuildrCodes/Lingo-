'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import { useState } from 'react'

const PLANS = [
  {
    tier: 'Free',
    price: '₦0', period: '/month',
    note: 'Forever. No card.',
    color: '#a3aac4',
    features: ['30 min/month','1-to-1 audio calls','3 language pairs','Live translated captions','Basic latency'],
    cta: 'Start Free', href: '/auth?mode=signup', featured: false,
  },
  {
    tier: 'Starter',
    price: '₦5,000', period: '/month',
    note: '~$3.50 USD · Less than one interpreter call',
    color: '#D946EF',
    features: ['400 min/month','All 120+ language pairs','Priority low-latency servers','Caption history & transcripts','Dual-script captions','Trade-term glossary'],
    cta: 'Get Starter', href: '/auth?mode=signup', featured: true,
  },
  {
    tier: 'Trade-Pass',
    price: '₦70', period: '/minute',
    note: 'No subscription required',
    color: '#ff8439',
    features: ['No monthly commitment','Pay per call block','Full translation quality','Same quality as Starter','Perfect for one-off deals'],
    cta: 'Buy Credits', href: '/auth?mode=signup', featured: false,
  },
]

const ADDONS = [
  { label: '100 minutes', price: '₦3,000' },
  { label: '300 minutes', price: '₦8,000' },
  { label: '500 minutes', price: '₦12,000' },
]

const COMPARE = [
  { feature: 'Real-time voice translation',    lingo: true,  zoom: false, duo: false  },
  { feature: 'Live captions in your language', lingo: true,  zoom: false, duo: false  },
  { feature: 'Yoruba / Igbo support',          lingo: true,  zoom: false, duo: false  },
  { feature: 'Trade-term aware AI',            lingo: true,  zoom: false, duo: false  },
  { feature: 'Works in China',                 lingo: true,  zoom: true,  duo: false  },
  { feature: 'No download required',           lingo: true,  zoom: false, duo: true   },
  { feature: 'Free tier',                      lingo: true,  zoom: true,  duo: true   },
  { feature: 'Audio calls',                    lingo: true,  zoom: true,  duo: true   },
  { feature: 'End-to-end encryption',          lingo: true,  zoom: true,  duo: true   },
]

export default function PricingPage() {
  const [showAddons, setShowAddons] = useState(false)

  return (
    <div style={{ background: '#060e20', color: '#dee5ff', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <Nav />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, background: 'rgba(49,46,129,0.12)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '8rem 2rem 5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(25,37,64,0.6)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff8439', display: 'inline-block' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#a3aac4' }}>Pricing</span>
          </div>
          <h1 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem,5vw,4rem)', letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '1rem' }}>
            Cheaper than <span style={{ background: 'linear-gradient(90deg,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>one phone call</span>
          </h1>
          <p style={{ color: '#a3aac4', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
            An interpreter costs ₦80,000/hour. Lingo costs ₦5,000/month for 400 minutes. The maths is obvious.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {PLANS.map(p => (
            <div key={p.tier} style={{ background: '#060e20', border: `1px solid ${p.featured ? 'rgba(217,70,239,0.4)' : 'rgba(64,72,93,0.15)'}`, borderRadius: 16, padding: '2.5rem', position: 'relative', boxShadow: p.featured ? '0 0 60px rgba(217,70,239,0.08)' : 'none', transition: 'transform 0.3s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
              {p.featured && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', padding: '0.3rem 1.2rem', borderRadius: 9999, fontSize: '0.62rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: p.color, marginBottom: '1rem' }}>{p.tier}</div>
              <div style={{ marginBottom: '0.3rem' }}>
                <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.04em', color: '#F8FAFC' }}>{p.price}</span>
                <span style={{ color: '#6d758c', fontSize: '0.88rem' }}>{p.period}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6d758c', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(64,72,93,0.12)' }}>{p.note}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: '0.88rem', color: '#dee5ff', alignItems: 'flex-start' }}>
                    <span style={{ color: '#ff8439', flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} style={{ display: 'block', textAlign: 'center', padding: '0.9rem', borderRadius: 10, background: p.featured ? 'linear-gradient(45deg,#312E81,#D946EF,#F97316)' : 'rgba(255,255,255,0.06)', border: p.featured ? 'none' : '1px solid rgba(64,72,93,0.3)', color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', boxShadow: p.featured ? '0 0 24px rgba(217,70,239,0.2)' : 'none' }}>
                {p.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* Top-up addons */}
        <div style={{ background: 'rgba(15,25,48,0.6)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 12, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '1rem', marginBottom: '4rem', cursor: 'pointer' }} onClick={() => setShowAddons(s => !s)}>
          <div>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC', marginBottom: '0.2rem' }}>Need more minutes?</div>
            <div style={{ fontSize: '0.78rem', color: '#6d758c' }}>Top up anytime — no subscription required.</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
            {ADDONS.map(a => (
              <div key={a.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(64,72,93,0.2)', borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#dee5ff' }}>
                {a.label} → {a.price}
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: '2rem', textAlign: 'center' }}>
            Lingo vs <span style={{ background: 'linear-gradient(90deg,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>everything else</span>
          </h2>

          <div style={{ background: 'rgba(9,19,40,0.5)', border: '1px solid rgba(64,72,93,0.15)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid rgba(64,72,93,0.12)' }}>
              <div style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#6d758c' }}>Feature</div>
              {['Lingo!','Zoom','Google Duo'].map((p, i) => (
                <div key={p} style={{ padding: '1rem 1.5rem', textAlign: 'center' as const, fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: i === 0 ? '#D946EF' : '#a3aac4' }}>{p}</div>
              ))}
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(64,72,93,0.08)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <div style={{ padding: '0.9rem 1.5rem', fontSize: '0.85rem', color: '#dee5ff' }}>{row.feature}</div>
                {[row.lingo, row.zoom, row.duo].map((has, j) => (
                  <div key={j} style={{ padding: '0.9rem 1.5rem', textAlign: 'center' as const, fontSize: '1rem', color: has ? (j === 0 ? '#ff8439' : '#4ade80') : '#40485d' }}>
                    {has ? '✓' : '✗'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#a3aac4', marginBottom: '1.5rem', fontSize: '1rem' }}>Start free. No credit card. Cancel anytime.</p>
          <Link href="/auth?mode=signup" style={{ padding: '1rem 2.5rem', background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', borderRadius: 10, color: '#fff', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 0 30px rgba(217,70,239,0.25)' }}>
            Start Free — 30 Minutes Included →
          </Link>
        </div>
      </main>
    </div>
  )
}
