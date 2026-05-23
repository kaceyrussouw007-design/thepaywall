import crypto from 'crypto'
import type { NOWPaymentsPayment } from '@/types'

const BASE_URL = 'https://api.nowpayments.io/v1'

function getHeaders() {
  return {
    'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
    'Content-Type': 'application/json',
  }
}

export async function createPayment(params: {
  priceAmount: number
  payCurrency: string
  orderId: string
  orderDescription: string
}): Promise<NOWPaymentsPayment> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const res = await fetch(`${BASE_URL}/payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: 'usd',
      pay_currency: params.payCurrency,
      ipn_callback_url: `${appUrl}/api/payments/webhook`,
      order_id: params.orderId,
      order_description: params.orderDescription,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`NOWPayments error: ${error}`)
  }

  return res.json()
}

export async function getPaymentStatus(paymentId: string): Promise<NOWPaymentsPayment> {
  const res = await fetch(`${BASE_URL}/payment/${paymentId}`, {
    headers: getHeaders(),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`NOWPayments error: ${error}`)
  }

  return res.json()
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET!
  const sorted = sortObjectKeys(JSON.parse(rawBody))
  const hmac = crypto.createHmac('sha512', secret)
  hmac.update(JSON.stringify(sorted))
  const digest = hmac.digest('hex')
  return digest === signature
}

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.keys(obj)
      .sort()
      .map((key) => [key, obj[key]])
  )
}
