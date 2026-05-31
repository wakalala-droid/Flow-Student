// lib/engines/translator.ts
import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export interface TranslatorOptions {
  text: string
  targetLanguage: string
  tone: 'formal' | 'casual' | 'neutral'
}

export interface TranslatorResult {
  translatedText: string
  detectedLanguage: string
  targetLanguage: string
  confidence: number
  tokensUsed: number
}

export async function translateText(options: TranslatorOptions): Promise<TranslatorResult> {
  const { text, targetLanguage, tone } = options

  const toneGuide = { formal: 'formal register', casual: 'casual everyday language', neutral: 'neutral standard language' }[tone]

  const systemPrompt = `You are an expert translator. Translate the given text to ${targetLanguage} using ${toneGuide}. Preserve meaning, context, and formatting exactly. Output ONLY the translation — nothing else.`

  const translatedText = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.2,
    maxTokens: Math.max(Math.ceil(text.split(/\s+/).length * 2), 512),
    systemPrompt,
    userPrompt: text,
  })

  const detectPrompt = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0,
    maxTokens: 20,
    systemPrompt: 'Identify the language of the text. Respond with ONLY the language name, nothing else.',
    userPrompt: text.slice(0, 200),
  })

  return {
    translatedText: translatedText.trim(),
    detectedLanguage: detectPrompt.trim(),
    targetLanguage,
    confidence: 95,
    tokensUsed: Math.ceil((text.length + translatedText.length) / 4),
  }
}
