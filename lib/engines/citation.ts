import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export type CitationFormat = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'Vancouver' | 'IEEE'

export interface Citation {
  format: CitationFormat
  citation: string
  inText: string
}

export interface CitationResult {
  citations: Citation[]
  sourceType: string
  extractedInfo: {
    authors?: string[]
    title?: string
    year?: string
    journal?: string
    volume?: string
    issue?: string
    pages?: string
    url?: string
    publisher?: string
    doi?: string
  }
}

export async function generateCitations(text: string, formats: CitationFormat[] = ['APA', 'MLA', 'Chicago', 'Harvard']): Promise<CitationResult> {
  const systemPrompt = `You are an expert academic citation specialist. Extract source information from the text and generate properly formatted citations.

Return ONLY valid JSON:
{
  "source_type": "<journal|book|website|news|unknown>",
  "extracted_info": {
    "authors": ["<Author Last, First>"],
    "title": "<source title>",
    "year": "<year>",
    "journal": "<journal name if applicable>",
    "volume": "<volume>",
    "issue": "<issue>",
    "pages": "<pages>",
    "url": "<url if mentioned>",
    "publisher": "<publisher>",
    "doi": "<doi if mentioned>"
  },
  "citations": [
    {
      "format": "APA",
      "citation": "<full reference list citation in APA 7th edition>",
      "in_text": "<in-text citation e.g. (Smith, 2023)>"
    },
    {
      "format": "MLA",
      "citation": "<full Works Cited entry in MLA 9th edition>",
      "in_text": "<in-text citation e.g. (Smith 45)>"
    },
    {
      "format": "Chicago",
      "citation": "<full bibliography entry in Chicago 17th edition>",
      "in_text": "<footnote citation>"
    },
    {
      "format": "Harvard",
      "citation": "<full reference in Harvard style>",
      "in_text": "<in-text citation e.g. (Smith, 2023, p. 45)>"
    }
  ]
}`

  const response = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.1,
    maxTokens: 2048,
    systemPrompt,
    userPrompt: `Extract source info and generate citations for all requested formats from this text:\n\n${text}`,
  })

  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      citations: (parsed.citations ?? []).filter((c: Citation) => formats.includes(c.format)),
      sourceType: parsed.source_type ?? 'unknown',
      extractedInfo: parsed.extracted_info ?? {},
    }
  } catch {
    return { citations: [], sourceType: 'unknown', extractedInfo: {} }
  }
}
