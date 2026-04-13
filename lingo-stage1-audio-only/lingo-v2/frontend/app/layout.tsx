import type { Metadata } from 'next'
import '@livekit/components-styles'

export const metadata: Metadata = {
  title: 'Lingo! — Close the Deal in Any Language',
  description: 'Real-time AI voice translation for global traders. The platform that makes Zoom irrelevant.',
  openGraph: {
    title: 'Lingo! — Real-Time AI Translation',
    description: 'Speak your language. Understand everyone. Built for the Africa-Asia-Europe trade corridor.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet"/>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body { background: #060e20; color: #dee5ff; -webkit-font-smoothing: antialiased; }
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          @keyframes spin  { to { transform: rotate(360deg); } }
          @keyframes ping  { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.3); } }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
          a:hover { opacity: 0.85; }
          input:focus { border-color: rgba(217,70,239,0.5) !important; }
          button:hover { opacity: 0.9; }
          button:active { transform: scale(0.97); }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(64,72,93,0.4); border-radius: 3px; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
