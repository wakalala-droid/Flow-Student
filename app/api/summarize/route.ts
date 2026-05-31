// app/api/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { summarizeText } from '@/lib/engines/summarizer'
import { countWords } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, style = 'bullet', length = 'medium' } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const words = countWords(text)
    const { data: usageResult } = await supabase.rpc('increment_usage', { p_user_id: user.id, p_words: words, p_tool: 'summarizer' })
    if (!usageResult?.allowed) return NextResponse.json({ error: 'Word limit reached. Please upgrade your plan.' }, { status: 429 })

    const start = Date.now()
    const result = await summarizeText({ text, style, length })

    await supabase.from('ai_scans').insert({
      user_id: user.id, tool: 'summarizer',
      input_text: text, output_text: result.summary,
      result: { reductionPct: result.reductionPct, keyPoints: result.keyPoints },
      word_count: words, tokens_used: result.tokensUsed,
      processing_time_ms: Date.now() - start,
    })

    return NextResponse.json({ ...result, outputText: result.summary })
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Processing failed. Please try again.' }, { status: 500 })
  }
}
