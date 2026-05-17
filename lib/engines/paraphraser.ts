import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export type ParaphraseMode = 'Fluency' | 'Academic' | 'Creative' | 'Concise' | 'Expand' | 'Simplify' | 'Professional' | 'SEO'

export interface ParaphraseResult {
  paraphrasedText: string
  wordsOriginal: number
  wordsNew: number
  changePercent: number
}

const MODE_PROMPTS: Record<ParaphraseMode, string> = {
  Fluency: 'Rewrite for smooth, natural flow. Fix awkward phrasing. Keep the same length.',
  Academic: 'Rewrite in formal academic style with precise terminology, hedging language, and scholarly tone.',
  Creative: 'Rewrite with creative flair — vivid language, engaging rhythm, memorable phrasing.',
  Concise: 'Rewrite more concisely. Remove redundancy. Cut at least 30% of words while keeping all meaning.',
  Expand: 'Expand the text by adding relevant detail, examples, and elaboration. Increase length by 50-70%.',
  Simplify: 'Rewrite using simple language — short sentences, common words, easy to understand for anyone.',
  Professional: 'Rewrite for a professional business audience — confident, clear, action-oriented.',
  SEO: 'Rewrite optimized for web readability — clear headings-friendly structure, natural keyword flow, scannable.',
}

export async function paraphraseText(text: string, mode: ParaphraseMode, intensity: number = 70): Promise<ParaphraseResult> {
  const instruction = MODE_PROMPTS[mode]

  const systemPrompt = `You are a professional paraphrasing engine. Rewrite the given text according to the specified mode.

Mode: ${mode}
Instructions: ${instruction}
Intensity: ${intensity}% (higher = more rewriting)

Rules:
- Preserve all factual information and meaning
- Output ONLY the rewritten text, no explanations
- Do not add preamble like "Here is the rewritten text:"
- Match the paragraph/structure of the original unless mode says otherwise`

  const paraphrasedText = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.6 + (intensity / 200),
    maxTokens: Math.max(text.length * 2, 1024),
    systemPrompt,
    userPrompt: text,
  })

  const wordsOriginal = text.trim().split(/\s+/).length
  const wordsNew = paraphrasedText.trim().split(/\s+/).length
  const changePercent = Math.round(Math.abs(wordsNew - wordsOriginal) / wordsOriginal * 100)

  return { paraphrasedText, wordsOriginal, wordsNew, changePercent }
}
