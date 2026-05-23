import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  type: z.enum(['LINK', 'BUNDLE', 'FILE']),
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  priceUSD: z.number().min(0.5),
  linkUrl: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
  bundleLinks: z
    .array(z.object({ url: z.string().url(), label: z.string().min(1) }))
    .min(2)
    .optional(),
})

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const items = await prisma.paywallItem.findMany({
      where: { userId: user.id },
      include: {
        bundleLinks: { orderBy: { order: 'asc' } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/items:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { type, title, description, priceUSD, linkUrl, fileUrl, bundleLinks } = parsed.data

    // Generate unique slug
    let slug = generateSlug(title)
    const existing = await prisma.paywallItem.count({ where: { slug } })
    if (existing > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`

    const item = await prisma.paywallItem.create({
      data: {
        userId: user.id,
        type,
        title,
        description,
        slug,
        priceUSD,
        linkUrl,
        fileUrl,
        bundleLinks: bundleLinks
          ? {
              create: bundleLinks.map((link, i) => ({
                url: link.url,
                label: link.label,
                order: i,
              })),
            }
          : undefined,
      },
      include: {
        bundleLinks: true,
        _count: { select: { payments: true } },
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('POST /api/items:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
