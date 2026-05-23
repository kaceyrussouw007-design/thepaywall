import Link from 'next/link'
import { Lock, Link2, Package, FileDown, Zap, Shield, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

const features = [
  {
    icon: Link2,
    title: 'Lock a link',
    description: 'Hide any URL behind a paywall. Share tutorials, files, private pages, or anything online.',
  },
  {
    icon: Package,
    title: 'Sell a bundle',
    description: 'Group multiple links together. Perfect for courses, resource packs, and multi-part content.',
  },
  {
    icon: FileDown,
    title: 'Sell a file',
    description: 'Upload PDFs, ZIPs, videos, or any file and sell it as a digital download.',
  },
]

const cryptos = [
  { symbol: '₿', label: 'Bitcoin' },
  { symbol: 'Ξ', label: 'Ethereum' },
  { symbol: '◎', label: 'Solana' },
  { symbol: '✕', label: 'XRP' },
  { symbol: '₮', label: 'USDT TRC-20' },
]

const steps = [
  { n: '01', title: 'Create your item', body: 'Sign up and lock a link, bundle, or file. Set your price in USD.' },
  { n: '02', title: 'Share your page', body: 'Get a unique public URL like /pay/your-slug to share anywhere.' },
  { n: '03', title: 'Get paid', body: 'Buyers pay in crypto. Content unlocks automatically on confirmation.' },
]

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background pointer-events-none" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center relative">
            <Badge variant="violet" className="mb-6 text-xs px-3 py-1">
              No KYC · No banks · No gatekeepers
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Get paid in crypto.
              <br />
              <span className="text-violet-400">Instantly.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Lock any link, bundle of content, or downloadable file behind a crypto payment.
              Share it. Get paid. No middlemen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button variant="violet" size="xl" className="w-full sm:w-auto gap-2">
                  <Lock className="w-4 h-4" />
                  Start for free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>

            {/* Crypto badges */}
            <div className="flex items-center justify-center gap-3 mt-12 flex-wrap">
              {cryptos.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 text-sm"
                >
                  <span className="font-mono text-violet-400">{c.symbol}</span>
                  <span className="text-muted-foreground">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need to sell digital content</h2>
            <p className="text-muted-foreground">Three content types. One simple dashboard.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <Card key={f.title} className="hover:border-violet-600/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-violet-600/15 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Up and running in minutes</h2>
              <p className="text-muted-foreground">No complex setup. No bank accounts.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s) => (
                <div key={s.n} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-violet-600/15 border border-violet-600/30 flex items-center justify-center mx-auto">
                    <span className="text-sm font-bold text-violet-400">{s.n}</span>
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, title: 'Anonymous', body: 'Email and password only. Zero KYC required.' },
              { icon: Zap, title: 'Instant access', body: 'Content unlocks the moment payment confirms on-chain.' },
              { icon: Globe, title: 'Global', body: 'Accept BTC, ETH, SOL, XRP, and USDT from anyone.' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <div key={t.title} className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get paid?</h2>
            <p className="text-muted-foreground mb-8">Create your first paywall in under 2 minutes.</p>
            <Link href="/signup">
              <Button variant="violet" size="xl" className="gap-2">
                <Lock className="w-4 h-4" />
                Get started for free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
