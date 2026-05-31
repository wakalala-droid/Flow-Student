// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateText } from '@/lib/engines/translator'
import { countWords } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, targetLanguage = 'French', tone = 'neutral' } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const words = countWords(text)
    const { data: usageResult } = await supabase.rpc('increment_usage', { p_user_id: user.id, p_words: words, p_tool: 'translator' })
    if (!usageResult?.allowed) return NextResponse.json({ error: 'Word limit reached. Please upgrade your plan.' }, { status: 429 })

    const start = Date.now()
    const result = await translateText({ text, targetLanguage, tone })

    await supabase.from('ai_scans').insert({
      user_id: user.id, tool: 'translator',
      input_text: text, output_text: result.translatedText,
      result: { detectedLanguage: result.detectedLanguage, targetLanguage },
      word_count: words, tokens_used: result.tokensUsed,
      processing_time_ms: Date.now() - start,
    })

    return NextResponse.json({ ...result, outputText: result.translatedText })
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Processing failed. Please try again.' }, { status: 500 })
  }
}
