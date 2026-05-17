import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

export async function GET() {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const service = createServiceClient()
  const { data } = await service.from('profiles').select('*').order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { userId, updates } = await req.json()
  const service = createServiceClient()
  await service.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { userId } = await req.json()
  const service = createServiceClient()
  await service.from('profiles').delete().eq('id', userId)
  return NextResponse.json({ ok: true })
}
