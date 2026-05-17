import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export interface FactClaim {
  claim: string
  status: 'verified' | 'false' | 'uncertain' | 'unverifiable'
  confidence: number
  explanation: string
  source: string
  correction?: string
}

export interface FactCheckResult {
  claims: FactClaim[]
  overallScore: number
  totalClaims: number
  verified: number
  falseCount: number
  uncertain: number
}

export async function factCheck(text: string): Promise<FactCheckResult> {
  const systemPrompt = `You are an expert fact-checking AI. Extract factual claims from text and verify them based on your knowledge.

For each claim:
- Mark as "verified" if it's clearly true and well-established
- Mark as "false" if it contradicts well-known facts
- Mark as "uncertain" if evidence is mixed or unclear
- Mark as "unverifiable" if it cannot be checked from general knowledge

Return ONLY valid JSON:
{
  "claims": [
    {
      "claim": "<extracted factual claim>",
      "status": "<verified|false|uncertain|unverifiable>",
      "confidence": <0-100>,
      "explanation": "<brief explanation>",
      "source": "<type of source that would verify this e.g. 'NASA Research', 'Medical consensus'>",
      "correction": "<correct information if false, null if verified>"
    }
  ],
  "overall_score": <0-100 overall credibility score>
}`

  const response = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.1,
    maxTokens: 2048,
    systemPrompt,
    userPrompt: `Extract and verify all factual claims in this text:\n\n${text}`,
  })

  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    const claims: FactClaim[] = parsed.claims ?? []
    return {
      claims,
      overallScore: parsed.overall_score ?? 70,
      totalClaims: claims.length,
      verified: claims.filter(c => c.status === 'verified').length,
      falseCount: claims.filter(c => c.status === 'false').length,
      uncertain: claims.filter(c => c.status === 'uncertain').length,
    }
  } catch {
    return { claims: [], overallScore: 70, totalClaims: 0, verified: 0, falseCount: 0, uncertain: 0 }
  }
}
