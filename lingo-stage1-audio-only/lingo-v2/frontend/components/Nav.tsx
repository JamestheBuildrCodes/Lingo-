'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Nav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [loggedIn, setLoggedIn]   = useState(false)

  useEffect(() => {
    // Check if user has a session
    const name = sessionStorage.getItem('lingo_display_name')
    setLoggedIn(!!name)

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const handleSignOut = () => {
    sessionStorage.clear()
    setLoggedIn(false)
    router.push('/')
  }

  const isLanding = pathname === '/'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: scrolled || !isLanding ? 'rgba(6,14,32,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(64,72,93,0.12)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <svg width="32" height="20" viewBox="0 0 38 24" fill="none">
              <defs>
                <linearGradient id="nl" x1="0" y1="0" x2="38" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#312E81"/>
                  <stop offset="50%" stopColor="#D946EF"/>
                  <stop offset="100%" stopColor="#F97316"/>
                </linearGradient>
              </defs>
              <path d="M19 12C19 12 15 4 10 4C5.5 4 2 7.5 2 12C2 16.5 5.5 20 10 20C15 20 19 12 19 12Z" stroke="url(#nl)" strokeWidth="2.5" fill="none"/>
              <path d="M19 12C19 12 23 4 28 4C32.5 4 36 7.5 36 12C36 16.5 32.5 20 28 20C23 20 19 12 19 12Z" stroke="url(#nl)" strokeWidth="2.5" fill="none"/>
            </svg>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.04em', background: 'linear-gradient(90deg,#312E81,#D946EF,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              lingo!
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="nav-links">
            {[
              { label: 'Features',     href: '/#features'  },
              { label: 'How it works', href: '/#how'       },
              { label: 'Pricing',      href: '/pricing'    },
              { label: 'Corridors',    href: '/#corridors' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ color: '#a3aac4', textDecoration: 'none', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.88rem', transition: 'color 0.2s' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {loggedIn ? (
              <>
                <Link href="/dashboard" style={{ color: '#a3aac4', textDecoration: 'none', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.85rem' }}>Dashboard</Link>
                <button onClick={handleSignOut} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(64,72,93,0.3)', color: '#a3aac4' }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/auth" style={{ color: '#a3aac4', textDecoration: 'none', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '0.85rem' }}>Sign in</Link>
                <Link href="/auth?mode=signup" style={{ ...btnBase, background: 'linear-gradient(45deg,#312E81,#D946EF,#F97316)', color: '#fff', border: 'none', boxShadow: '0 0 20px rgba(217,70,239,0.25)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </>
  )
}

const btnBase: React.CSSProperties = {
  padding: '0.5rem 1.2rem', borderRadius: 8,
  fontFamily: "'Manrope',sans-serif", fontWeight: 700,
  fontSize: '0.85rem', cursor: 'pointer',
  transition: 'transform 0.15s, box-shadow 0.15s',
}
