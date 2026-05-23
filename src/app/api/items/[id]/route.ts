import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const item = await prisma.paywallItem.findUnique({ where: { id: params.id } })

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (item.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.paywallItem.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/items/[id]:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
