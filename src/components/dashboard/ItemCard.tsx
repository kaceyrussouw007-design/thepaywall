'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Trash2, Copy, Check, Link2, Package, FileDown, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatUSD, timeAgo } from '@/lib/utils'
import type { PaywallItemWithCounts } from '@/types'

interface ItemCardProps {
  item: PaywallItemWithCounts
  onDelete: (id: string) => void
}

const TYPE_CONFIG = {
  LINK: { label: 'Link', icon: Link2, variant: 'violet' as const },
  BUNDLE: { label: 'Bundle', icon: Package, variant: 'blue' as const },
  FILE: { label: 'File', icon: FileDown, variant: 'amber' as const },
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const config = TYPE_CONFIG[item.type]
  const TypeIcon = config.icon
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${item.slug}`

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('Delete this paywall item? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/items/${item.id}`, { method: 'DELETE' })
      if (res.ok) onDelete(item.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="group hover:border-violet-600/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-violet-600/10 flex items-center justify-center shrink-0">
              <TypeIcon className="w-4 h-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{item.title}</h3>
              {item.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
              )}
            </div>
          </div>
          <Badge variant={config.variant} className="shrink-0">{config.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{item._count.payments} paid</span>
          </div>
          <span className="font-semibold text-violet-400">{formatUSD(item.priceUSD)}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate flex-1 font-mono">/pay/{item.slug}</span>
          <span className="shrink-0">{timeAgo(item.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={copyLink}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </Button>

          <Link href={`/pay/${item.slug}`} target="_blank">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
