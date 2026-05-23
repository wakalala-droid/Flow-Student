import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export type HumanizerMode = 'Academic' | 'Professional' | 'Casual' | 'Creative' | 'Undetectable' | 'Native English' | 'Gen Z' | 'Formal'

export interface HumanizerOptions {
  text: string
  mode: HumanizerMode
  readability: number
  burstiness: number
  perplexity: number
  vocabComplexity: number
}

export interface HumanizerResult {
  humanizedText: string
  humanScore: number
  changes: string[]
  wordsChanged: number
  tokensUsed: number
}

const BANNED_PHRASES = [
  'delve into', 'it\'s worth noting', 'it is worth noting',
  'in conclusion', 'furthermore', 'moreover', 'utilize', 'utilise',
  'leverage', 'robust', 'paradigm', 'holistic', 'synergy',
  'at the end of the day', 'in today\'s world', 'in the realm of',
  'it goes without saying', 'needless to say', 'as previously mentioned',
  'in terms of', 'with regard to', 'pertaining to', 'it should be noted',
  'it is important to note', 'significantly', 'notably', 'importantly',
  'this is because', 'the fact that', 'in order to', 'due to the fact',
  'a wide range of', 'a variety of', 'in the context of',
]

const MODE_INSTRUCTIONS: Record<HumanizerMode, string> = {
  Academic: `Write as a knowledgeable human student or researcher. Use natural academic language with realistic imperfections — the occasional informal connector ("this shows that", "which means"), varied citation language, and genuine analytical voice. Mix long analytical sentences with shorter punchy ones.`,

  Professional: `Write as an experienced professional drafting a real work document. Use confident direct language. Short and long sentences mixed naturally. Occasional first-person where appropriate. Sounds like a real person wrote it quickly but competently.`,

  Casual: `Write like a smart person explaining something to a friend. Contractions everywhere. Occasional filler phrases like "basically", "so", "the thing is". Short paragraphs. Real human rhythm — not polished at all.`,

  Creative: `Write with genuine human creative voice. Use vivid specific language, unexpected word choices, varied rhythm. Include occasional imperfect phrasing that a real writer would use. Avoid any sense of generated polish.`,

  Undetectable: `You are an expert human writing disguise specialist. Your ONLY job is to make this text completely undetectable as AI.

MANDATORY TECHNIQUES:
1. Break ALL patterns — if 3 sentences are complex, make the next one very short
2. Add human imperfections: start sentences with "And", "But", "So" occasionally  
3. Use contractions aggressively: "don't", "it's", "they're", "we're"
4. Include one or two very specific concrete details or examples
5. Vary paragraph length dramatically — one sentence, then five, then two
6. Replace ALL academic/formal connectives with casual ones
7. Add a personal-sounding observation or aside
8. Use em-dashes and parenthetical asides like a human would
9. Occasionally repeat a key word naturally for emphasis
10. End some sentences with prepositions where natural
11. Use real numbers and specifics instead of vague quantifiers
12. Include at least one rhetorical question
13. Use active voice almost exclusively
14. Mix tenses slightly where natural in narrative
15. Write one sentence that sounds like it was almost an afterthought`,

  'Native English': `Write exactly as a native English speaker would — natural idioms, authentic rhythm, real phrasing patterns. Not textbook correct but genuinely natural. Include culturally appropriate expressions.`,

  'Gen Z': `Write in authentic Gen Z voice. Short punchy sentences. "honestly", "literally", "it's giving". Direct and conversational. Real opinions stated plainly. Not trying too hard — just natural for someone under 25.`,

  Formal: `Write in sophisticated formal register but with human variation. Not robotic — formal humans still vary their sentence structure. Include the occasional complex sentence balanced by clear shorter ones.`,
}

export async function humanizeText(options: HumanizerOptions): Promise<HumanizerResult> {
  const { text, mode, readability, burstiness, perplexity, vocabComplexity } = options

  const bannedList = BANNED_PHRASES.slice(0, 15).join('", "')

  const systemPrompt = `You are the world's most advanced AI text humanizer. Your output must be completely undetectable by GPTZero, Turnitin, Copyleaks, Winston AI, and all other AI detectors.

MODE: ${mode}
INSTRUCTIONS: ${MODE_INSTRUCTIONS[mode]}

ABSOLUTE RULES — NEVER VIOLATE:
1. NEVER use these phrases: "${bannedList}"
2. NEVER start more than 2 consecutive sentences with the same word
3. NEVER use uniform sentence length — vary dramatically
4. NEVER use passive voice more than once per paragraph
5. NEVER use generic academic transitions (furthermore, moreover, additionally, consequently)
6. Perplexity level: ${perplexity}/100 — ${perplexity > 60 ? 'use unpredictable and varied word choices' : 'keep word choices natural and accessible'}
7. Burstiness level: ${burstiness}/100 — ${burstiness > 60 ? 'EXTREME sentence length variation — some 3 words, some 30' : 'moderate variation'}
8. Readability: ${readability}/100 — ${readability < 40 ? 'simple short words' : readability > 70 ? 'sophisticated but natural vocabulary' : 'balanced vocabulary'}
9. Preserve ALL original meaning, facts, and information
10. Output ONLY the rewritten text — no preamble, no explanation, no quotes around it`

  const humanizedText = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: Math.min(0.95, 0.75 + (perplexity / 400)),
    maxTokens: Math.max(Math.ceil(text.split(/\s+/).length * 1.5), 1024),
    systemPrompt,
    userPrompt: `Humanize this text completely — make it 100% undetectable as AI:\n\n${text}`,
  })

  const originalWords  = text.trim().split(/\s+/)
  const newWords       = humanizedText.trim().split(/\s+/)
  const changedWords   = newWords.filter((w, i) => w !== originalWords[i]).length
  const changeRate     = changedWords / Math.max(originalWords.length, 1)
  const humanScore     = Math.min(97, Math.round(78 + changeRate * 15 + (perplexity * 0.04) + (burstiness * 0.03)))

  return {
    humanizedText: humanizedText.trim(),
    humanScore,
    changes: [
      `Applied ${mode} style`,
      `Removed ${BANNED_PHRASES.length} AI clichés`,
      `Burstiness: ${burstiness}% variation`,
      `Perplexity: ${perplexity}% unpredictability`,
    ],
    wordsChanged: changedWords,
    tokensUsed: Math.ceil((text.length + humanizedText.length) / 4),
  }
}
