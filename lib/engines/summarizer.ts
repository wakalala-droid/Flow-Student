// lib/engines/summarizer.ts
import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export interface SummarizerOptions {
  text: string
  style: 'bullet' | 'paragraph' | 'tldr' | 'academic'
  length: 'short' | 'medium' | 'detailed'
}

export interface SummarizerResult {
  summary: string
  keyPoints: string[]
  wordCount: number
  reductionPct: number
  tokensUsed: number
}

export async function summarizeText(options: SummarizerOptions): Promise<SummarizerResult> {
  const { text, style, length } = options
  const lengthGuide = { short: '2-3 sentences', medium: '1 paragraph', detailed: '2-3 paragraphs' }[length]
  const styleGuide = {
    bullet: 'Return a bullet-point summary with clear concise points.',
    paragraph: 'Return a flowing paragraph summary.',
    tldr: 'Return a single TL;DR sentence followed by 3 bullet points.',
    academic: 'Return a formal academic-style abstract.',
  }[style]

  const systemPrompt = `You are an expert summarizer. ${styleGuide} Length: ${lengthGuide}. Be concise and preserve all key information. Output ONLY the summary — no preamble.`

  const summary = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.3,
    maxTokens: 1024,
    systemPrompt,
    userPrompt: `Summarize this text:\n\n${text}`,
  })

  const keyPointsPrompt = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.2,
    maxTokens: 256,
    systemPrompt: 'Extract exactly 3 key points from the text. Return ONLY a JSON array of 3 short strings. No other text.',
    userPrompt: text.slice(0, 2000),
  })

  let keyPoints: string[] = []
  try {
    const clean = keyPointsPrompt.replace(/```json|```/g, '').trim()
    keyPoints = JSON.parse(clean)
  } catch { keyPoints = ['Key insight 1', 'Key insight 2', 'Key insight 3'] }

  const originalWords = text.trim().split(/\s+/).length
  const summaryWords  = summary.trim().split(/\s+/).length
  const reductionPct  = Math.round(((originalWords - summaryWords) / originalWords) * 100)

  return {
    summary: summary.trim(),
    keyPoints,
    wordCount: summaryWords,
    reductionPct: Math.max(0, reductionPct),
    tokensUsed: Math.ceil((text.length + summary.length) / 4),
  }
}
