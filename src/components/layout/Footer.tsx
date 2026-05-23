import Link from 'next/link'
import { Lock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </div>
          ThePaywall
        </Link>
        <p>Built for creators. Powered by crypto.</p>
      </div>
    </footer>
  )
}
