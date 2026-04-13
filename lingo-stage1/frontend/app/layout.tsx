import type { Metadata } from 'next'
import './globals.css'
import '@livekit/components-styles'

export const metadata: Metadata = {
  title: 'Lingo — Speak Any Language',
  description: 'Real-time multilingual video calls. Speak your language, hear theirs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
