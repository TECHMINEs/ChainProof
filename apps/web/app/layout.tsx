import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Chakra_Petch, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import BrandBar from '@/components/brand/BrandBar'
import BrandFooter from '@/components/brand/BrandFooter'
import DemoInitializer from '@/components/DemoInitializer'

const fontDisplay = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-chakra', display: 'swap' })
const fontBody = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex', display: 'swap' })
const fontMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-jetbrains', display: 'swap' })
const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`

export const metadata: Metadata = {
  title: 'ChainProof — Forensic Evidence Chain of Custody',
  description: 'Cryptographically secure forensic evidence chain of custody',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <link rel="icon" href="/ChainProof/logo-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/ChainProof/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen text-white flex flex-col">
        <DemoInitializer />
        <BrandBar project="ChainProof — Forensic Chain of Custody" />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <BrandFooter />
      </body>
    </html>
  )
}
