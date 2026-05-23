'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ItemCard } from '@/components/dashboard/ItemCard'
import type { PaywallItemWithCounts } from '@/types'

export default function DashboardPage() {
  const [items, setItems] = useState<PaywallItemWithCounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/items')
      .then((r) => r.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false))
  }, [])

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const totalPayments = items.reduce((sum, item) => sum + item._count.payments, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} · {totalPayments} total payment{totalPayments !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button variant="violet" className="gap-2">
            <Plus className="w-4 h-4" />
            New item
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="font-semibold mb-2">No paywalls yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first paywall to start earning crypto.
          </p>
          <Link href="/dashboard/new">
            <Button variant="violet" className="gap-2">
              <Plus className="w-4 h-4" />
              Create your first item
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
