import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGrammar } from '@/lib/engines/grammar'
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
      p_user_id: user.id, p_words: words, p_tool: 'grammar',
    })
    if (!usageResult?.allowed) return NextResponse.json({ error: 'Word limit reached. Upgrade your plan.' }, { status: 429 })

    const start = Date.now()
    const result = await checkGrammar(text)

    await supabase.from('ai_scans').insert({
      user_id: user.id, tool: 'grammar',
      input_text: text, output_text: result.correctedText,
      result: { score: result.score, issueCount: result.issues.length },
      word_count: words, processing_time_ms: Date.now() - start,
    })

    return NextResponse.json({ ...result, outputText: result.correctedText })
  } catch (e) {
    console.error('Grammar error:', e)
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 })
  }
}
