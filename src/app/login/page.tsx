import { Lock } from 'lucide-react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: 'Sign in — ThePaywall' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg">ThePaywall</span>
      </Link>
      <LoginForm />
    </div>
  )
}
