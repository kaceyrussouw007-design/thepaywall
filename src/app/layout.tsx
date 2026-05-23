import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThePaywall — Sell content with crypto',
  description: 'Lock links, bundles, and files behind crypto payments. No KYC. No middlemen.',
  openGraph: {
    title: 'ThePaywall',
    description: 'Sell digital content with crypto payments',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
