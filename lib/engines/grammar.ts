import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export interface GrammarIssue {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'clarity' | 'passive'
  original: string
  suggestion: string
  explanation: string
  position?: number
}

export interface GrammarResult {
  correctedText: string
  issues: GrammarIssue[]
  score: number
  readabilityGrade: string
  stats: {
    passiveVoice: number
    avgSentenceLength: number
    longSentences: number
    adverbs: number
  }
}

export async function checkGrammar(text: string): Promise<GrammarResult> {
  const systemPrompt = `You are an expert proofreader and grammar specialist. Analyze the text for all errors and return ONLY valid JSON.

Check for: grammar errors, spelling mistakes, punctuation issues, passive voice, wordiness, clarity problems, wrong word usage, subject-verb agreement, pronoun errors, article usage.

Return this exact JSON structure:
{
  "corrected_text": "<fully corrected version of the text>",
  "issues": [
    {
      "type": "<grammar|spelling|punctuation|style|clarity|passive>",
      "original": "<the problematic phrase>",
      "suggestion": "<corrected version>",
      "explanation": "<brief explanation why>"
    }
  ],
  "score": <0-100 writing quality score>,
  "readability_grade": "<e.g. Grade 8, Grade 12, University>",
  "stats": {
    "passive_voice_count": <number>,
    "avg_sentence_length": <number>,
    "long_sentences": <number>,
    "adverb_count": <number>
  }
}`

  const response = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.1,
    maxTokens: 3000,
    systemPrompt,
    userPrompt: `Proofread and analyze this text:\n\n${text}`,
  })

  try {
    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return {
      correctedText: parsed.corrected_text ?? text,
      issues: parsed.issues ?? [],
      score: parsed.score ?? 70,
      readabilityGrade: parsed.readability_grade ?? 'Grade 10',
      stats: {
        passiveVoice: parsed.stats?.passive_voice_count ?? 0,
        avgSentenceLength: parsed.stats?.avg_sentence_length ?? 15,
        longSentences: parsed.stats?.long_sentences ?? 0,
        adverbs: parsed.stats?.adverb_count ?? 0,
      },
    }
  } catch {
    return {
      correctedText: text,
      issues: [],
      score: 75,
      readabilityGrade: 'Grade 10',
      stats: { passiveVoice: 0, avgSentenceLength: 15, longSentences: 0, adverbs: 0 },
    }
  }
}
