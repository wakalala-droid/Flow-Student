export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  country: string
  phone: string | null
  plan: 'free' | 'student' | 'pro' | 'team'
  words_used: number
  words_limit: number
  scans_used: number
  scans_limit: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  amount: number
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  current_period_end: string
  mobile_number: string | null
  network: string | null
  created_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  content: string | null
  word_count: number
  tool_used: string | null
  status: 'draft' | 'processed' | 'exported'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AIScan {
  id: string
  user_id: string
  tool: ToolKey
  input_text: string
  output_text: string | null
  result: Record<string, unknown>
  word_count: number
  tokens_used: number
  processing_time_ms: number | null
  created_at: string
}

export interface PaymentTransaction {
  id: string
  user_id: string
  tx_ref: string
  amount: number
  currency: string
  mobile_number: string
  network: string
  plan: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  created_at: string
}

export type ToolKey =
  | 'humanizer'
  | 'detector'
  | 'plagiarism'
  | 'paraphraser'
  | 'grammar'
  | 'factcheck'
  | 'seo'
  | 'tone'
  | 'citation'

export interface ToolMeta {
  key: ToolKey
  label: string
  icon: string
  description: string
  badge?: string
  minPlan: 'free' | 'student' | 'pro'
}

export const TOOLS: ToolMeta[] = [
  { key: 'humanizer',  label: 'AI Humanizer',        icon: '✨', description: 'Make AI text sound natural', badge: 'HOT', minPlan: 'free' },
  { key: 'detector',  label: 'AI Detector',          icon: '🔍', description: 'Detect AI-generated content', minPlan: 'free' },
  { key: 'plagiarism',label: 'Plagiarism Check',     icon: '📋', description: 'Check originality', minPlan: 'student' },
  { key: 'paraphraser',label:'Paraphraser',          icon: '🔄', description: 'Rewrite intelligently', minPlan: 'free' },
  { key: 'grammar',   label: 'Grammar Fix',          icon: '✅', description: 'Fix all writing issues', minPlan: 'free' },
  { key: 'factcheck', label: 'Fact Checker',         icon: '🧾', description: 'Verify claims & facts', minPlan: 'student' },
  { key: 'seo',       label: 'SEO Optimizer',        icon: '📈', description: 'Optimise for search', minPlan: 'pro' },
  { key: 'tone',      label: 'Tone Rewriter',        icon: '🎭', description: 'Adapt tone for any audience', minPlan: 'free' },
  { key: 'citation',  label: 'Citation Generator',   icon: '📚', description: 'APA, MLA, Chicago & more', minPlan: 'student' },
]

export const PLAN_ORDER = { free: 0, student: 1, pro: 2, team: 3 }

export function canUseTool(userPlan: string, minPlan: string): boolean {
  return PLAN_ORDER[userPlan as keyof typeof PLAN_ORDER] >= PLAN_ORDER[minPlan as keyof typeof PLAN_ORDER]
}
