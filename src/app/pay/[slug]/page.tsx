'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { Lock, FileDown, Package, Link2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { formatUSD } from '@/lib/utils'
import { SUPPORTED_CRYPTOS } from '@/types'

interface PageProps {
  params: { slug: string }
}

interface ItemData {
  id: string
  title: string
  description: string | null
  type: 'LINK' | 'BUNDLE' | 'FILE'
  priceUSD: number
  bundleLinks?: Array<{ label: string; url: string }>
}

const TYPE_META = {
  LINK: { label: 'Exclusive link', icon: Link2 },
  BUNDLE: { label: 'Content bundle', icon: Package },
  FILE: { label: 'Downloadable file', icon: FileDown },
}

export default function PayPage({ params }: PageProps) {
  const [item, setItem] = useState<ItemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [found, setFound] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch(`/api/items/by-slug/${params.slug}`)
      .then((r) => {
        if (!r.ok) { setFound(false); return null }
        return r.json()
      })
      .then((data) => { if (data) setItem(data) })
      .finally(() => setLoading(false))
  }, [params.slug])

  if (!found && !loading) return notFound()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!item) return null

  const meta = TYPE_META[item.type]
  const MetaIcon = meta.icon

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-background to-background pointer-events-none" />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Item card */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-violet-600/15 flex items-center justify-center">
                <MetaIcon className="w-5 h-5 text-violet-400" />
              </div>
              <Badge variant="violet" className="text-xs">{meta.label}</Badge>
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-tight">{item.title}</h1>
              {item.description && (
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              )}
            </div>

            {item.type === 'BUNDLE' && item.bundleLinks && item.bundleLinks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Included in bundle</p>
                <div className="space-y-1.5">
                  {item.bundleLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-md bg-secondary">
                      <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span>{link.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-sm">Price</span>
                <span className="text-2xl font-bold text-violet-400">{formatUSD(item.priceUSD)}</span>
              </div>

              <Button
                variant="violet"
                size="lg"
                className="w-full gap-2 text-base"
                onClick={() => setModalOpen(true)}
              >
                <Lock className="w-4 h-4" />
                Pay with Crypto
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                Secure · Instant access on confirmation
              </div>
            </div>
          </div>

          {/* Supported cryptos */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SUPPORTED_CRYPTOS.map((c) => (
              <div
                key={c.code}
                className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary rounded-full px-2.5 py-1"
              >
                <span className="font-mono text-violet-400">{c.icon}</span>
                {c.code}
              </div>
            ))}
          </div>
        </div>
      </main>

      {item && (
        <PaymentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          item={{ id: item.id, title: item.title, priceUSD: item.priceUSD }}
        />
      )}
    </div>
  )
}
