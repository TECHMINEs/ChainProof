import './globals.css'
import type { Metadata } from 'next'
import BrandBar from '@/components/brand/BrandBar'
import BrandFooter from '@/components/brand/BrandFooter'

export const metadata: Metadata = {
  title: 'ChainProof — Forensic Evidence Chain of Custody',
  description: 'Cryptographically secure forensic evidence chain of custody',
  manifest: '/manifest.json',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/techmines-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/techmines-icon.png" />
      </head>
      <body className="bg-black min-h-screen text-white flex flex-col">
        <BrandBar project="ChainProof — Forensic Chain of Custody" />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <BrandFooter />
      </body>
    </html>
  )
}
