// lib/engines/social.ts
import { groqChat, GROQ_MODELS } from '@/lib/grok/client'

export type SocialPlatform = 'Twitter/X' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'TikTok'
export type SocialTone = 'Professional' | 'Casual' | 'Funny' | 'Inspirational' | 'Educational'

export interface SocialOptions {
  topic: string
  platform: SocialPlatform
  tone: SocialTone
  includeHashtags: boolean
  includeEmoji: boolean
}

export interface SocialResult {
  post: string
  hashtags: string[]
  characterCount: number
  suggestions: string[]
  tokensUsed: number
}

const PLATFORM_RULES: Record<SocialPlatform, string> = {
  'Twitter/X':  'Max 280 characters. Punchy, direct, hook in first line. Threads allowed.',
  'LinkedIn':   'Professional. 150-300 words. Value-driven. Start with a hook. Line breaks for readability.',
  'Instagram':  'Visual storytelling. 150-200 words. Engaging caption. Call to action.',
  'Facebook':   'Conversational. 40-80 words optimal. Relatable, shareable.',
  'TikTok':     'Very casual, Gen Z friendly, short punchy sentences. Trending energy.',
}

export async function writeSocialPost(options: SocialOptions): Promise<SocialResult> {
  const { topic, platform, tone, includeHashtags, includeEmoji } = options

  const systemPrompt = `You are a top social media copywriter. Write a ${tone.toLowerCase()} ${platform} post about the given topic.
Platform rules: ${PLATFORM_RULES[platform]}
${includeEmoji ? 'Include relevant emojis naturally.' : 'No emojis.'}
${includeHashtags ? 'Add 3-5 relevant hashtags at the end.' : 'No hashtags.'}
Output ONLY the post text — no preamble, no labels.`

  const post = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.8,
    maxTokens: 512,
    systemPrompt,
    userPrompt: `Write a ${platform} post about: ${topic}`,
  })

  const hashtagsRaw = await groqChat({
    model: GROQ_MODELS.primary,
    temperature: 0.5,
    maxTokens: 80,
    systemPrompt: 'Generate 5 relevant hashtags for the topic. Return ONLY a JSON array of strings without # symbol. No other text.',
    userPrompt: topic,
  })

  let hashtags: string[] = []
  try {
    const clean = hashtagsRaw.replace(/```json|```/g, '').trim()
    hashtags = JSON.parse(clean)
  } catch { hashtags = ['trending', 'viral', 'content'] }

  return {
    post: post.trim(),
    hashtags,
    characterCount: post.trim().length,
    suggestions: [
      `Post at peak hours for ${platform}`,
      'Engage with comments in first hour',
      'Add a visual for better reach',
    ],
    tokensUsed: Math.ceil((topic.length + post.length) / 4),
  }
}
