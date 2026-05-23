import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const item = await prisma.paywallItem.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        priceUSD: true,
        bundleLinks: {
          select: { label: true, url: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(item)
  } catch (error) {
    console.error('GET /api/items/by-slug/[slug]:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
