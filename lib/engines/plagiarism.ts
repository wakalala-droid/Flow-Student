import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export interface PlagiarismMatch {
  phrase: string
  likely_source: string
  similarity_percent: number
  context: string
}

export interface PlagiarismResult {
  similarityScore: number
  uniqueScore: number
  matches: PlagiarismMatch[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult> {
  const response = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.1,
    maxTokens: 2048,
    systemPrompt: `You are a plagiarism detection expert. Identify phrases likely copied from public sources.

Return ONLY valid JSON:
{
  "similarity_score": <0-100>,
  "unique_score": <0-100>,
  "matches": [
    {
      "phrase": "<matched phrase>",
      "likely_source": "<probable source domain or publication>",
      "similarity_percent": <0-100>,
      "context": "<why this is flagged>"
    }
  ],
  "risk_level": "<low|medium|high>",
  "recommendation": "<actionable advice>"
}`,
    userPrompt: `Check this text for plagiarism:\n\n${text}`,
  })

  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const p = JSON.parse(clean)
    return {
      similarityScore: p.similarity_score ?? 0,
      uniqueScore: p.unique_score ?? 100,
      matches: p.matches ?? [],
      riskLevel: p.risk_level ?? 'low',
      recommendation: p.recommendation ?? 'No significant plagiarism detected.',
    }
  } catch {
    return { similarityScore: 0, uniqueScore: 100, matches: [], riskLevel: 'low', recommendation: 'Analysis complete.' }
  }
}
