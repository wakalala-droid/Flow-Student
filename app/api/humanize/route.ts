import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { humanizeText } from '@/lib/engines/humanizer'
import { countWords } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { text, mode = 'Academic', readability = 65, burstiness = 70, perplexity = 60, vocabComplexity = 40 } = body

    if (!text?.trim()) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

    const words = countWords(text)

    // Check usage limits
    const { data: usageResult } = await supabase.rpc('increment_usage', {
      p_user_id: user.id, p_words: words, p_tool: 'humanizer',
    })
    if (!usageResult?.allowed) {
      return NextResponse.json({ error: 'Word limit reached. Please upgrade your plan.' }, { status: 429 })
    }

    const start = Date.now()
    const result = await humanizeText({ text, mode, readability, burstiness, perplexity, vocabComplexity })

    // Save scan
    await supabase.from('ai_scans').insert({
      user_id: user.id, tool: 'humanizer',
      input_text: text, output_text: result.humanizedText,
      result: { humanScore: result.humanScore, wordsChanged: result.wordsChanged },
      word_count: words, tokens_used: result.tokensUsed,
      processing_time_ms: Date.now() - start,
    })

    return NextResponse.json({ ...result, outputText: result.humanizedText })
  } catch (e: unknown) {
    console.error('Humanize error:', e)
    return NextResponse.json({ error: 'Processing failed. Please try again.' }, { status: 500 })
  }
}
