import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/nowpayments'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-nowpayments-sig')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const nowpaymentsId = String(payload.payment_id)
    const status = payload.payment_status

    const payment = await prisma.payment.findUnique({ where: { nowpaymentsId } })

    if (!payment) {
      // Not a payment we created — ignore
      return NextResponse.json({ ok: true })
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        amountCrypto: payload.pay_amount ?? payment.amountCrypto,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/payments/webhook:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
