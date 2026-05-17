import Groq from 'groq-sdk'

// Free Groq API - uses Llama 3.3 70B and other free models
// Sign up at console.groq.com — completely free with generous rate limits

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Best free models on Groq (as of 2025)
export const GROQ_MODELS = {
  // Primary - fastest & most capable free model
  primary: 'llama-3.3-70b-versatile',
  // Fast for simple tasks
  fast: 'llama-3.1-8b-instant',
  // Deep analysis tasks
  deep: 'mixtral-8x7b-32768',
  // Long context (32k tokens)
  longContext: 'mixtral-8x7b-32768',
} as const

export type GroqModel = typeof GROQ_MODELS[keyof typeof GROQ_MODELS]

export interface GroqChatOptions {
  model?: GroqModel
  temperature?: number
  maxTokens?: number
  systemPrompt: string
  userPrompt: string
  stream?: boolean
}

// Core completion function
export async function groqChat(options: GroqChatOptions): Promise<string> {
  const {
    model = GROQ_MODELS.primary,
    temperature = 0.7,
    maxTokens = 2048,
    systemPrompt,
    userPrompt,
  } = options

  const completion = await groq.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  return completion.choices[0]?.message?.content || ''
}

// Streaming completion for real-time output
export async function groqStream(options: GroqChatOptions) {
  const {
    model = GROQ_MODELS.primary,
    temperature = 0.7,
    maxTokens = 2048,
    systemPrompt,
    userPrompt,
  } = options

  return await groq.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })
}

// Count approximate tokens (1 token ≈ 4 chars)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Count words
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
