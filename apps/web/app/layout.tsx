import './globals.css'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import BrandBar from '@/components/brand/BrandBar'
import BrandFooter from '@/components/brand/BrandFooter'
import DemoInitializer from '@/components/DemoInitializer'

const fontDisplay = localFont({ src: [
  { path: './fonts/chakra-500.ttf', weight: '500' },
  { path: './fonts/chakra-600.ttf', weight: '600' },
  { path: './fonts/chakra-700.ttf', weight: '700' },
], variable: '--font-chakra', display: 'swap' })
const fontBody = localFont({ src: [
  { path: './fonts/plex-400.ttf', weight: '400' },
  { path: './fonts/plex-500.ttf', weight: '500' },
  { path: './fonts/plex-600.ttf', weight: '600' },
], variable: '--font-plex', display: 'swap' })
const fontMono = localFont({ src: [
  { path: './fonts/jetbrains-400.ttf', weight: '400' },
  { path: './fonts/jetbrains-500.ttf', weight: '500' },
  { path: './fonts/jetbrains-700.ttf', weight: '700' },
], variable: '--font-jetbrains', display: 'swap' })
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
