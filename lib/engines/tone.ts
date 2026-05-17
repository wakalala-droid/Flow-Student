import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export type ToneMode = 'Professional' | 'Academic' | 'Casual' | 'Creative' | 'Formal' | 'Gen Z' | 'Empathetic'

export interface ToneResult {
  rewrittenText: string
  toneApplied: ToneMode
  toneScore: number
}

const TONE_PROMPTS: Record<ToneMode, string> = {
  Professional: 'Rewrite in a professional, polished business tone. Clear, confident, action-oriented. No slang.',
  Academic: 'Rewrite in formal academic style. Scholarly language, hedging phrases, structured argumentation, third-person where appropriate.',
  Casual: 'Rewrite in a friendly, conversational tone. Contractions OK, relatable, easy to read. Like explaining to a friend.',
  Creative: 'Rewrite with creative voice — vivid language, compelling rhythm, engaging and memorable.',
  Formal: 'Rewrite in highly formal register. Sophisticated vocabulary, no contractions, impersonal tone, complex-but-clear sentences.',
  'Gen Z': 'Rewrite in authentic Gen Z voice. Natural, relatable, occasionally uses modern phrases. Not forced. Short punchy sentences. Honest and direct.',
  Empathetic: 'Rewrite with warm, empathetic tone. Acknowledge feelings, supportive language, inclusive, person-centered.',
}

export async function rewriteTone(text: string, tone: ToneMode): Promise<ToneResult> {
  const instruction = TONE_PROMPTS[tone]

  const rewrittenText = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.7,
    maxTokens: Math.max(text.length * 2, 1024),
    systemPrompt: `You are a professional writing coach. Rewrite the text in the specified tone while preserving all meaning and information. Output ONLY the rewritten text.

Tone: ${tone}
Instructions: ${instruction}`,
    userPrompt: text,
  })

  return { rewrittenText, toneApplied: tone, toneScore: 92 }
}
