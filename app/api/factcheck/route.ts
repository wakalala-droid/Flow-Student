import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { factCheck } from '@/lib/engines/factcheck'
import { countWords } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const words = countWords(text)
    const { data: usageResult } = await supabase.rpc('increment_usage', {
      p_user_id: user.id, p_words: words, p_tool: 'factcheck',
    })
    if (!usageResult?.allowed) return NextResponse.json({ error: 'Word limit reached.' }, { status: 429 })

    const start = Date.now()
    const result = await factCheck(text)

    await supabase.from('ai_scans').insert({
      user_id: user.id, tool: 'factcheck',
      input_text: text,
      result: { totalClaims: result.totalClaims, verified: result.verified, falseCount: result.falseCount },
      word_count: words, processing_time_ms: Date.now() - start,
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error('Factcheck error:', e)
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 })
  }
}
