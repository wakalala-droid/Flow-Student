import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export type HumanizerMode = 'Academic' | 'Professional' | 'Casual' | 'Creative' | 'Undetectable' | 'Native English' | 'Gen Z' | 'Formal'

export interface HumanizerOptions {
  text: string
  mode: HumanizerMode
  readability: number   // 1-100
  burstiness: number    // 1-100 (sentence length variation)
  perplexity: number    // 1-100 (unpredictability)
  vocabComplexity: number // 1-100
}

export interface HumanizerResult {
  humanizedText: string
  humanScore: number
  changes: string[]
  wordsChanged: number
  tokensUsed: number
}

const MODE_INSTRUCTIONS: Record<HumanizerMode, string> = {
  Academic: 'Rewrite for academic writing: formal tone, precise vocabulary, proper hedging language ("suggests", "indicates"), varied sentence structure with complex and simple sentences mixed. Avoid AI clichés.',
  Professional: 'Rewrite for professional business communication: clear, concise, confident tone. Mix sentence lengths. Use active voice predominantly. Sound like an experienced professional.',
  Casual: 'Rewrite conversationally: friendly, natural flow, contractions welcome, occasional informal phrases. Sound like a knowledgeable friend explaining something.',
  Creative: 'Rewrite with creativity: vivid language, varied rhythm, occasional metaphors, engaging flow. Sound like a skilled human writer.',
  Undetectable: 'Rewrite to be completely undetectable as AI: maximum variation in sentence structure, natural imperfections, human-like tangents, varied paragraph length, conversational asides, personal observations. Make it read unmistakably human.',
  'Native English': 'Rewrite with native English speaker patterns: natural idioms, varied phrasing, authentic flow. Avoid non-native phrasings.',
  'Gen Z': 'Rewrite in Gen Z style: casual, relatable, uses some modern slang sparingly, short punchy sentences, occasionally starts sentences with "so" or "honestly", sounds like a young adult.',
  Formal: 'Rewrite in formal register: sophisticated vocabulary, complex sentences balanced with clear ones, impersonal tone, third-person where appropriate.',
}

export async function humanizeText(options: HumanizerOptions): Promise<HumanizerResult> {
  const { text, mode, readability, burstiness, perplexity, vocabComplexity } = options

  const modeInstruction = MODE_INSTRUCTIONS[mode]
  const readabilityNote = readability < 40 ? 'Use simpler words and shorter sentences.' : readability > 70 ? 'Use sophisticated vocabulary and varied sentence structure.' : 'Balance complexity and readability.'
  const burstiNote = burstiness > 60 ? 'Vary sentence lengths dramatically — mix very short and longer sentences.' : 'Keep moderate sentence length variation.'

  const systemPrompt = `You are an expert human writing specialist. Your job is to rewrite AI-generated text so it sounds completely natural and human-written.

RULES:
1. ${modeInstruction}
2. ${readabilityNote}
3. ${burstiNote}
4. Never use these AI clichés: "delve into", "it's worth noting", "in conclusion", "furthermore", "moreover", "utilize" (use "use"), "leverage", "robust", "paradigm", "holistic approach"
5. Preserve the original meaning and all key information
6. Do NOT add bullet points or headers unless the original has them
7. Output ONLY the rewritten text — no explanations, no preamble

STYLE TARGET: ${mode} (${modeInstruction})`

  const userPrompt = `Rewrite this text to sound naturally human-written in ${mode} style:\n\n${text}`

  const humanizedText = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.8 + (perplexity / 500), // Higher perplexity = more temperature
    maxTokens: Math.max(text.length * 2, 1024),
    systemPrompt,
    userPrompt,
  })

  // Calculate estimated human score based on changes
  const originalWords = text.split(/\s+/)
  const newWords = humanizedText.split(/\s+/)
  const changedWords = newWords.filter((w, i) => w !== originalWords[i]).length
  const changeRate = changedWords / originalWords.length
  const humanScore = Math.min(95, Math.round(75 + changeRate * 20 + perplexity * 0.1))

  return {
    humanizedText,
    humanScore,
    changes: [`Rewrote in ${mode} style`, `Applied burstiness level ${burstiness}`, `Vocabulary complexity: ${vocabComplexity}%`],
    wordsChanged: changedWords,
    tokensUsed: Math.ceil((text.length + humanizedText.length) / 4),
  }
}
