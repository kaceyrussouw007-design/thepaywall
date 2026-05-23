import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createPayment } from '@/lib/nowpayments'
import { v4 as uuidv4 } from 'uuid'

const schema = z.object({
  itemId: z.string().uuid(),
  payCurrency: z.string().min(2).max(20),
  buyerEmail: z.string().email().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { itemId, payCurrency, buyerEmail } = parsed.data

    const item = await prisma.paywallItem.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    const orderId = uuidv4()

    const npPayment = await createPayment({
      priceAmount: item.priceUSD,
      payCurrency,
      orderId,
      orderDescription: `Access to: ${item.title}`,
    })

    const payment = await prisma.payment.create({
      data: {
        itemId: item.id,
        nowpaymentsId: String(npPayment.payment_id),
        status: npPayment.payment_status,
        cryptoCurrency: payCurrency,
        amountCrypto: npPayment.pay_amount,
        amountUSD: item.priceUSD,
        buyerEmail,
        accessToken: uuidv4(),
      },
    })

    return NextResponse.json({
      nowpaymentsId: payment.nowpaymentsId,
      payAddress: npPayment.pay_address,
      payAmount: npPayment.pay_amount,
      payCurrency: npPayment.pay_currency,
      accessToken: payment.accessToken,
    })
  } catch (error) {
    console.error('POST /api/payments/create:', error)
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
