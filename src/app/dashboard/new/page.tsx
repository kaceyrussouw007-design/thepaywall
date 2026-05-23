import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateItemForm } from '@/components/dashboard/CreateItemForm'

export const metadata = { title: 'Create paywall — ThePaywall' }

export default function NewItemPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create paywall</h1>
          <p className="text-sm text-muted-foreground">Choose what to sell and set your price</p>
        </div>
      </div>

      <CreateItemForm />
    </div>
  )
}
