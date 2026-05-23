import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentStatus } from '@/lib/nowpayments'
import { CONFIRMED_STATUSES } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { nowpaymentsId: params.id },
    })

    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Check live status from NOWPayments
    const npStatus = await getPaymentStatus(params.id)
    const status = npStatus.payment_status

    // Update DB if status changed
    if (status !== payment.status) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          amountCrypto: npStatus.pay_amount,
        },
      })
    }

    return NextResponse.json({
      status,
      accessToken: CONFIRMED_STATUSES.includes(status as never) ? payment.accessToken : undefined,
    })
  } catch (error) {
    console.error('GET /api/payments/status/[id]:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
