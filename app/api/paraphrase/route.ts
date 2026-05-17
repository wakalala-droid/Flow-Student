import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paraphraseText } from '@/lib/engines/paraphraser'
import { countWords } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, mode = 'Fluency', intensity = 70 } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const words = countWords(text)
    const { data: usageResult } = await supabase.rpc('increment_usage', {
      p_user_id: user.id, p_words: words, p_tool: 'paraphraser',
    })
    if (!usageResult?.allowed) return NextResponse.json({ error: 'Word limit reached.' }, { status: 429 })

    const start = Date.now()
    const result = await paraphraseText(text, mode, intensity)

    await supabase.from('ai_scans').insert({
      user_id: user.id, tool: 'paraphraser',
      input_text: text, output_text: result.paraphrasedText,
      result: { mode, changePercent: result.changePercent },
      word_count: words, processing_time_ms: Date.now() - start,
    })

    return NextResponse.json({ ...result, outputText: result.paraphrasedText })
  } catch (e) {
    console.error('Paraphrase error:', e)
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 })
  }
}
