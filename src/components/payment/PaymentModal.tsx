'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CountdownTimer } from '@/components/payment/CountdownTimer'
import { SUPPORTED_CRYPTOS, CONFIRMED_STATUSES } from '@/types'
import { formatUSD, formatCrypto, truncateAddress } from '@/lib/utils'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    title: string
    priceUSD: number
  }
}

type Step = 'select' | 'paying' | 'confirmed' | 'expired'

interface PaymentData {
  nowpaymentsId: string
  payAddress: string
  payAmount: number
  payCurrency: string
  accessToken: string
}

export function PaymentModal({ open, onOpenChange, item }: PaymentModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select')
  const [selectedCrypto, setSelectedCrypto] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [pollingStatus, setPollingStatus] = useState<string>('waiting')

  const handleExpire = useCallback(() => setStep('expired'), [])

  async function startPayment() {
    if (!selectedCrypto) return
    setCreating(true)
    setError(null)

    try {
      const crypto = SUPPORTED_CRYPTOS.find((c) => c.code === selectedCrypto)!
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          payCurrency: crypto.nowpaymentsCode,
          buyerEmail: buyerEmail || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Failed to create payment')
        return
      }

      const data = await res.json()
      setPaymentData(data)
      setStep('paying')
      startPolling(data.nowpaymentsId, data.accessToken)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  function startPolling(nowpaymentsId: string, accessToken: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${nowpaymentsId}`)
        if (!res.ok) return
        const { status } = await res.json()
        setPollingStatus(status)

        if (CONFIRMED_STATUSES.includes(status)) {
          clearInterval(interval)
          setStep('confirmed')
          setTimeout(() => {
            router.push(`/access/${accessToken}`)
          }, 2000)
        } else if (status === 'failed' || status === 'expired') {
          clearInterval(interval)
          setStep('expired')
        }
      } catch {
        // ignore polling errors
      }
    }, 12000)

    return () => clearInterval(interval)
  }

  async function copyToClipboard(text: string, type: 'address' | 'amount') {
    await navigator.clipboard.writeText(text)
    if (type === 'address') {
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } else {
      setCopiedAmount(true)
      setTimeout(() => setCopiedAmount(false), 2000)
    }
  }

  function reset() {
    setStep('select')
    setSelectedCrypto('')
    setPaymentData(null)
    setError(null)
    setPollingStatus('waiting')
  }

  const selectedCryptoInfo = SUPPORTED_CRYPTOS.find((c) => c.code === selectedCrypto)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Crypto</DialogTitle>
          <DialogDescription>
            {formatUSD(item.priceUSD)} to unlock: <span className="text-foreground font-medium">{item.title}</span>
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Choose currency</Label>
              <div className="grid grid-cols-1 gap-2">
                {SUPPORTED_CRYPTOS.map((crypto) => (
                  <button
                    key={crypto.code}
                    type="button"
                    onClick={() => setSelectedCrypto(crypto.code)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                      selectedCrypto === crypto.code
                        ? 'border-violet-600 bg-violet-600/10 text-foreground'
                        : 'border-border hover:border-violet-600/40 hover:bg-violet-600/5'
                    }`}
                  >
                    <span className="text-lg font-mono">{crypto.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{crypto.label}</div>
                      <div className="text-xs text-muted-foreground">{crypto.code}</div>
                    </div>
                    {selectedCrypto === crypto.code && (
                      <Check className="w-4 h-4 text-violet-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-muted-foreground">(optional, for receipt)</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              variant="violet"
              className="w-full"
              disabled={!selectedCrypto || creating}
              onClick={startPayment}
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue to payment
            </Button>
          </div>
        )}

        {step === 'paying' && paymentData && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Badge variant="amber">Waiting for payment</Badge>
              <span className="text-xs text-muted-foreground capitalize">{pollingStatus}</span>
            </div>

            <CountdownTimer durationSeconds={900} onExpire={handleExpire} />

            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Send exactly</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-lg font-bold font-mono">
                    {formatCrypto(paymentData.payAmount)} {paymentData.payCurrency.toUpperCase()}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => copyToClipboard(String(paymentData.payAmount), 'amount')}
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">To this address</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-foreground break-all">
                    {paymentData.payAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => copyToClipboard(paymentData.payAddress, 'address')}
                  >
                    {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                <span>Network: {selectedCryptoInfo?.label}</span>
                <span>{formatUSD(item.priceUSD)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              This page will automatically update once your payment is confirmed on-chain.
            </p>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Payment confirmed!</h3>
              <p className="text-sm text-muted-foreground mt-1">Redirecting you to your content...</p>
            </div>
          </div>
        )}

        {step === 'expired' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">Payment expired</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The payment window has closed. Please start again.
              </p>
            </div>
            <Button variant="violet" onClick={reset} className="w-full">
              Try again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
