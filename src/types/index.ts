import type { ItemType } from '@prisma/client'

export type { ItemType }

export interface PaywallItemWithCounts {
  id: string
  type: ItemType
  title: string
  description: string | null
  slug: string
  priceUSD: number
  linkUrl: string | null
  fileUrl: string | null
  createdAt: Date
  _count: { payments: number }
  bundleLinks: Array<{ id: string; url: string; label: string; order: number }>
}

export interface PaymentRecord {
  id: string
  itemId: string
  nowpaymentsId: string
  status: string
  cryptoCurrency: string
  amountCrypto: number | null
  amountUSD: number
  buyerEmail: string | null
  accessToken: string
  createdAt: Date
}

export interface NOWPaymentsPayment {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  order_description: string
  expiration_estimate_date: string
}

export interface CryptoCurrency {
  code: string
  label: string
  nowpaymentsCode: string
  icon: string
}

export const SUPPORTED_CRYPTOS: CryptoCurrency[] = [
  { code: 'BTC', label: 'Bitcoin', nowpaymentsCode: 'btc', icon: '₿' },
  { code: 'ETH', label: 'Ethereum', nowpaymentsCode: 'eth', icon: 'Ξ' },
  { code: 'SOL', label: 'Solana', nowpaymentsCode: 'sol', icon: '◎' },
  { code: 'XRP', label: 'XRP', nowpaymentsCode: 'xrp', icon: '✕' },
  { code: 'USDT', label: 'USDT (TRC-20)', nowpaymentsCode: 'usdttrc20', icon: '₮' },
]

export type PaymentStatus =
  | 'waiting'
  | 'confirming'
  | 'confirmed'
  | 'sending'
  | 'partially_paid'
  | 'finished'
  | 'failed'
  | 'refunded'
  | 'expired'

export const CONFIRMED_STATUSES: PaymentStatus[] = ['confirmed', 'finished']
