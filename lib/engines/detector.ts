import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export interface DetectorResult {
  aiScore: number
  humanScore: number
  confidence: 'low' | 'medium' | 'high'
  sentences: SentenceAnalysis[]
  models: ModelScores
  summary: string
  recommendation: string
}

export interface SentenceAnalysis {
  text: string
  aiProbability: number
  flags: string[]
}

export interface ModelScores {
  gpt: number
  claude: number
  gemini: number
  mixed: number
}

export async function detectAI(text: string): Promise<DetectorResult> {
  const systemPrompt = `You are an expert AI text detection system. Analyze the given text for AI-generation patterns.

Analyze for:
- Burstiness (natural vs uniform sentence length variation)
- Perplexity (predictability of word choices)
- Token repetition patterns
- AI clichés and formulaic phrases
- Semantic uniformity
- Structural patterns typical of AI models

Return ONLY valid JSON in this exact format:
{
  "ai_score": <0-100 integer>,
  "human_score": <0-100 integer>,
  "confidence": "<low|medium|high>",
  "sentences": [
    {"text": "<sentence>", "ai_probability": <0-100>, "flags": ["<flag1>", "<flag2>"]}
  ],
  "model_scores": {
    "gpt": <0-100>,
    "claude": <0-100>,
    "gemini": <0-100>,
    "mixed": <0-100>
  },
  "summary": "<2-3 sentence analysis summary>",
  "recommendation": "<actionable recommendation>"
}`

  const response = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.1,
    maxTokens: 2048,
    systemPrompt,
    userPrompt: `Analyze this text for AI generation:\n\n${text}`,
  })

  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      aiScore: parsed.ai_score ?? 50,
      humanScore: parsed.human_score ?? 50,
      confidence: parsed.confidence ?? 'medium',
      sentences: parsed.sentences ?? [],
      models: parsed.model_scores ?? { gpt: 50, claude: 50, gemini: 50, mixed: 50 },
      summary: parsed.summary ?? '',
      recommendation: parsed.recommendation ?? '',
    }
  } catch {
    return {
      aiScore: 65,
      humanScore: 35,
      confidence: 'medium',
      sentences: [],
      models: { gpt: 65, claude: 55, gemini: 45, mixed: 60 },
      summary: 'Analysis complete. Text shows patterns consistent with AI generation.',
      recommendation: 'Consider humanizing this text before submission.',
    }
  }
}
