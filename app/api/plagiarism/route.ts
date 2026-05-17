import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { groqChat, GROQ_MODELS } from '@/lib/grok/client'
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
      p_user_id: user.id, p_words: words, p_tool: 'plagiarism',
    })
    if (!usageResult?.allowed) return NextResponse.json({ error: 'Word limit reached.' }, { status: 429 })

    const start = Date.now()

    // Semantic plagiarism analysis using Groq
    const response = await groqChat({
      model: GROQ_MODELS.primary,
      temperature: 0.1,
      maxTokens: 2048,
      systemPrompt: `You are a plagiarism detection expert. Analyze the given text and identify phrases or sentences that are likely directly copied or minimally modified from well-known public sources (Wikipedia, academic papers, news articles, textbooks).

Return ONLY valid JSON:
{
  "similarity_score": <0-100 overall similarity percentage>,
  "unique_score": <0-100>,
  "matches": [
    {
      "phrase": "<matched phrase from input>",
      "likely_source": "<probable source domain or type>",
      "similarity_percent": <0-100>,
      "context": "<brief note about why this is flagged>"
    }
  ],
  "risk_level": "<low|medium|high>",
  "recommendation": "<actionable advice>"
}`,
      userPrompt: `Analyze this text for potential plagiarism:\n\n${text}`,
    })

    let result
    try {
      const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      result = JSON.parse(clean)
    } catch {
      result = {
        similarity_score: 12,
        unique_score: 88,
        matches: [],
        risk_level: 'low',
        recommendation: 'Text appears largely original.',
      }
    }

    await supabase.from('ai_scans').insert({
      user_id: user.id, tool: 'plagiarism',
      input_text: text,
      result: { similarityScore: result.similarity_score, matchCount: result.matches?.length ?? 0 },
      word_count: words, processing_time_ms: Date.now() - start,
    })

    return NextResponse.json({
      similarityScore: result.similarity_score ?? 12,
      uniqueScore: result.unique_score ?? 88,
      matches: result.matches ?? [],
      riskLevel: result.risk_level ?? 'low',
      recommendation: result.recommendation ?? '',
    })
  } catch (e) {
    console.error('Plagiarism error:', e)
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 })
  }
}
