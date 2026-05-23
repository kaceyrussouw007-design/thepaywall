import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ExternalLink, Download, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { prisma } from '@/lib/prisma'
import { formatUSD } from '@/lib/utils'

interface PageProps {
  params: { token: string }
}

export const dynamic = 'force-dynamic'

async function getPaymentWithItem(token: string) {
  return prisma.payment.findUnique({
    where: { accessToken: token },
    include: {
      item: {
        include: { bundleLinks: { orderBy: { order: 'asc' } } },
      },
    },
  })
}

export default async function AccessPage({ params }: PageProps) {
  const payment = await getPaymentWithItem(params.token)

  if (!payment) notFound()

  const isPaid = payment.status === 'confirmed' || payment.status === 'finished'

  if (!isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-600/15 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">Payment pending</h2>
            <p className="text-sm text-muted-foreground">
              Your payment is still being confirmed on-chain. This page will unlock once
              the transaction is confirmed. Check back in a few minutes.
            </p>
            <Badge variant="amber">{payment.status}</Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { item } = payment

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        {/* Success header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-600/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">You&apos;re in!</h1>
            <p className="text-muted-foreground text-sm mt-1">Payment confirmed · Save this page URL</p>
          </div>
        </div>

        {/* Content card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />

            {item.type === 'LINK' && item.linkUrl && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Your exclusive link:</p>
                <Link href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="violet" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open link
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground font-mono break-all text-center">
                  {item.linkUrl}
                </p>
              </div>
            )}

            {item.type === 'BUNDLE' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Your bundle contents:</p>
                <div className="space-y-2">
                  {item.bundleLinks.map((link, i) => (
                    <Link
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:border-violet-600/40 hover:bg-violet-600/5 transition-colors group"
                    >
                      <span className="font-medium text-sm">{link.label}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {item.type === 'FILE' && item.fileUrl && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Your download:</p>
                <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="violet" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Download file
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment summary */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Paid {formatUSD(payment.amountUSD)} · {payment.cryptoCurrency.toUpperCase()}</p>
          <p>Bookmark this page — access is permanent.</p>
        </div>
      </div>
    </div>
  )
}
