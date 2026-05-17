import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export interface SEOResult {
  score: number
  optimizedText: string
  metaDescription: string
  suggestedTitle: string
  keywords: string[]
  checks: SEOCheck[]
  readabilityGrade: string
}

export interface SEOCheck {
  name: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
}

export async function optimizeSEO(text: string, targetKeyword?: string): Promise<SEOResult> {
  const systemPrompt = `You are an expert SEO content strategist. Analyze and optimize the given text for search engines.

Return ONLY valid JSON:
{
  "score": <0-100 SEO score>,
  "optimized_text": "<SEO-optimized version of the text>",
  "meta_description": "<150-160 char meta description>",
  "suggested_title": "<compelling SEO title under 60 chars>",
  "keywords": ["<keyword1>", "<keyword2>", "<up to 8 keywords>"],
  "checks": [
    {"name": "<check name>", "status": "<pass|warn|fail>", "detail": "<brief detail>"}
  ],
  "readability_grade": "<grade level>"
}

Checks to include: Keyword density, Title length, Meta description, Heading structure, Content length, Passive voice, Sentence length, LSI keywords, Internal links suggestion, CTA presence`

  const response = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.3,
    maxTokens: 3000,
    systemPrompt,
    userPrompt: `Analyze and optimize this text for SEO${targetKeyword ? ` targeting keyword: "${targetKeyword}"` : ''}:\n\n${text}`,
  })

  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      score: parsed.score ?? 60,
      optimizedText: parsed.optimized_text ?? text,
      metaDescription: parsed.meta_description ?? '',
      suggestedTitle: parsed.suggested_title ?? '',
      keywords: parsed.keywords ?? [],
      checks: parsed.checks ?? [],
      readabilityGrade: parsed.readability_grade ?? 'Grade 10',
    }
  } catch {
    return {
      score: 60,
      optimizedText: text,
      metaDescription: '',
      suggestedTitle: '',
      keywords: [],
      checks: [],
      readabilityGrade: 'Grade 10',
    }
  }
}
