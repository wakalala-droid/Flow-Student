'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const TOOLS = [
  { icon: '✨', name: 'AI Humanizer',     desc: 'Makes AI text completely undetectable. Passes GPTZero, Turnitin, Winston AI.' },
  { icon: '🔍', name: 'AI Detector',      desc: 'Sentence-level heatmap shows exactly which parts read as AI-generated.' },
  { icon: '📋', name: 'Plagiarism Check', desc: 'Semantic comparison against billions of web sources and academic papers.' },
  { icon: '🔄', name: 'Paraphraser',      desc: '8 modes: Academic, Creative, Concise, SEO, Professional and more.' },
  { icon: '✅', name: 'Grammar Fix',      desc: 'Catches grammar, spelling, passive voice, clarity issues with one-click fixes.' },
  { icon: '🧾', name: 'Fact Checker',     desc: 'Extracts and verifies every factual claim with trusted sources.' },
  { icon: '📈', name: 'SEO Optimizer',    desc: 'Real-time scoring, keyword suggestions, meta descriptions and more.' },
  { icon: '🎭', name: 'Tone Rewriter',    desc: 'Switch between Professional, Academic, Casual, Gen Z and 4 more tones.' },
  { icon: '📚', name: 'Citations',         desc: 'Auto-generates APA, MLA, Chicago, Harvard from any source text.' },
]

const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Sign up free in 30 seconds. No credit card required. Google login available.' },
  { n: '02', title: 'Paste your text',     desc: 'Drop in your essay, assignment or article. Text stays saved as you switch tools.' },
  { n: '03', title: 'Pick your tool',      desc: 'Humanize, check grammar, detect AI, cite sources — all from one dashboard.' },
  { n: '04', title: 'Get instant results', desc: 'Powered by Groq AI. Results in seconds, not minutes. Copy and use immediately.' },
]

const PLANS = [
  {
    name: 'Free',
    price: 'ZMW 0',
    period: 'forever',
    features: ['5,000 words/month', '10 AI scans', 'All 9 tools', 'Email support'],
    cta: 'Get Started Free',
    href: '/auth/register',
    highlight: false,
  },
  {
    name: 'Student',
    price: 'ZMW 49',
    period: 'per month',
    features: ['20,000 words/month', '50 AI scans', 'All tools unlimited', 'Plagiarism checks', 'Priority support'],
    cta: 'Start Student Plan',
    href: '/auth/register',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'ZMW 99',
    period: 'per month',
    features: ['50,000 words/month', '200 AI scans', 'Document uploads', 'Export reports', 'API access'],
    cta: 'Go Pro',
    href: '/auth/register',
    highlight: false,
  },
]

const FAQS = [
  { q: 'Will my humanized text pass AI detectors?', a: 'Yes. Our humanizer is tested against GPTZero, Turnitin, Copyleaks, and Winston AI. The Undetectable mode applies 15 techniques including sentence burstiness, banned phrase removal, and forced variation to ensure your text reads as fully human.' },
  { q: 'How do I pay?', a: 'We accept Airtel Money directly to our number. After paying, you submit your transaction ID and we activate your account within 15 minutes. WhatsApp confirmation available.' },
  { q: 'Does my text stay private?', a: 'Yes. Your text is processed through our secure API and stored only in your personal account. We never use your content for training or share it with third parties.' },
  { q: 'Can I use it on my phone?', a: 'Absolutely. Flow-Student is fully optimized for mobile with a bottom navigation bar, tab switching, and touch-friendly controls. Works on any smartphone browser.' },
  { q: 'What AI model powers it?', a: 'We use Llama 3.3 70B via Groq, one of the fastest and most capable open models available. Results are delivered in seconds.' },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [wordCount, setWordCount] = useState(0)

  // Animated counter
  useEffect(() => {
    let frame: number
    let start: number
    const target = 847293
    const duration = 2500
    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setWordCount(Math.floor(progress * target))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate) }, 500)
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame) }
  }, [])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', background: 'rgba(10,10,15,0.85)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700 }}>✦</div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3 }}>Flow-Student</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(232,232,240,0.6)' }}>
          {['Features', 'How it works', 'Pricing', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: 'rgba(232,232,240,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.color = '#e8e8f0')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(232,232,240,0.6)')}>
              {item}
            </a>
          ))}
        </div>
        <Link href="/auth/register" style={{ padding: '8px 18px', background: '#6c63ff', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.background = '#7b73ff')}
          onMouseOut={e => (e.currentTarget.style.background = '#6c63ff')}>
          Get started free →
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.08)', fontSize: 12, color: '#a78bfa', marginBottom: 32, fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            For students in Zambia and beyond
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, marginBottom: 24, color: '#fff' }}>
            Write Smarter.{' '}
            <span style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Stay Undetected.
            </span>
            <br />Pass Every Time.
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(232,232,240,0.6)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            The all-in-one AI writing suite that humanizes text, checks grammar, detects AI, verifies facts, and generates citations — in seconds.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link href="/auth/register" style={{ padding: '14px 28px', background: '#6c63ff', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Start for free →
            </Link>
            <Link href="#how-it-works" style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.05)', color: '#e8e8f0', borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              See how it works
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { value: `${wordCount.toLocaleString()}+`, label: 'Words humanized' },
              { value: '9', label: 'AI tools in one' },
              { value: '< 3s', label: 'Average response' },
              { value: '97%', label: 'Human score avg' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#a78bfa', letterSpacing: -1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,232,240,0.4)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCROLLING TOOL MARQUEE */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', gap: 32, animation: 'marquee 20s linear infinite', width: 'max-content' }}>
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', whiteSpace: 'nowrap', fontSize: 13, color: 'rgba(232,232,240,0.5)' }}>
              <span>{t.icon}</span> {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* DASHBOARD PREVIEW */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', background: '#111118', boxShadow: '0 0 120px rgba(108,99,255,0.08)' }}>
            {/* Browser chrome */}
            <div style={{ background: '#0d0d14', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#f87171','#fb923c','#34d399'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(232,232,240,0.3)', textAlign: 'center', maxWidth: 300, margin: '0 auto' }}>
                flow-student.vercel.app/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div style={{ display: 'flex', minHeight: 340 }}>
              {/* Sidebar */}
              <div style={{ width: 180, borderRight: '1px solid rgba(255,255,255,0.07)', padding: '16px 12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '0 4px' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✦</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#e8e8f0' }}>Flow-Student</span>
                </div>
                {TOOLS.slice(0, 6).map((t, i) => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, marginBottom: 2, background: i === 0 ? 'rgba(108,99,255,0.15)' : 'transparent', color: i === 0 ? '#a78bfa' : 'rgba(232,232,240,0.4)', fontSize: 11 }}>
                    <span style={{ fontSize: 13 }}>{t.icon}</span> {t.name}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div style={{ flex: 1, padding: 20 }}>
                <div style={{ display: 'flex', gap: 12, height: '100%' }}>
                  {/* Input */}
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(232,232,240,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Input</div>
                    <div style={{ fontSize: 11, color: 'rgba(232,232,240,0.5)', lineHeight: 1.7 }}>The implementation of artificial intelligence technologies has demonstrated significant potential in optimizing various operational processes within educational institutions...</div>
                    <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ padding: '5px 12px', background: '#6c63ff', borderRadius: 6, fontSize: 10, color: '#fff', fontWeight: 600 }}>▶ Humanize</div>
                    </div>
                  </div>
                  {/* Output */}
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(232,232,240,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>Humanized Output</span>
                      <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(52,211,153,0.15)', color: '#34d399', borderRadius: 4, fontWeight: 600 }}>94% Human</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(232,232,240,0.7)', lineHeight: 1.7 }}>AI in education has real promise — but the way it gets talked about often misses the point. In practice, what matters is whether students are actually learning better, not whether the tech sounds impressive...</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['✓ Undetectable', 'Burstiness ↑', 'Perplexity 78'].map(b => (
                        <span key={b} style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(108,99,255,0.15)', color: '#a78bfa', borderRadius: 4 }}>{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6c63ff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>9 Tools in One</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>Everything You Need to Write Better</h2>
            <p style={{ fontSize: 16, color: 'rgba(232,232,240,0.5)', maxWidth: 500, margin: '0 auto' }}>One platform. All the AI writing tools students actually need.</p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {TOOLS.map((tool, i) => (
            <FadeIn key={tool.name} delay={i * 60}>
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, transition: 'border-color 0.2s, background 0.2s', cursor: 'default' }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,99,255,0.4)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(108,99,255,0.05)' }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{tool.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0', marginBottom: 6 }}>{tool.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(232,232,240,0.5)', lineHeight: 1.6 }}>{tool.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6c63ff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Simple Steps</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: -1 }}>Up and Running in 60 Seconds</h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {STEPS.map((step, i) => (
              <FadeIn key={step.n} delay={i * 100}>
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: 'rgba(108,99,255,0.12)', letterSpacing: -2, lineHeight: 1, marginBottom: 16 }}>{step.n}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0', marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(232,232,240,0.5)', lineHeight: 1.6 }}>{step.desc}</div>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: 'absolute', top: 24, right: -12, fontSize: 20, color: 'rgba(108,99,255,0.3)', display: 'none' }}>→</div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6c63ff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Pricing Plans</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>Affordable for Every Student</h2>
            <p style={{ fontSize: 15, color: 'rgba(232,232,240,0.5)', marginBottom: 28 }}>Paid via Airtel Money. Activated in minutes.</p>

            {/* Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['monthly', 'yearly'] as const).map(c => (
                <button key={c} onClick={() => setCycle(c)}
                  style={{ padding: '6px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: cycle === c ? '#6c63ff' : 'transparent', color: cycle === c ? '#fff' : 'rgba(232,232,240,0.5)', transition: 'all 0.2s' }}>
                  {c === 'monthly' ? 'Monthly' : 'Yearly (save 2mo)'}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 80}>
              <div style={{ padding: 28, border: plan.highlight ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 16, background: plan.highlight ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', background: '#6c63ff', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>
                    {cycle === 'yearly' && plan.name !== 'Free'
                      ? `ZMW ${parseInt(plan.price.replace('ZMW ', '')) * 10}`
                      : plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(232,232,240,0.4)', marginLeft: 4 }}>/{cycle === 'yearly' ? 'year' : plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'rgba(232,232,240,0.6)', marginBottom: 8 }}>
                      <span style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: plan.highlight ? '#6c63ff' : 'rgba(255,255,255,0.07)', color: plan.highlight ? '#fff' : '#e8e8f0', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}>
                  {plan.cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={200}>
          <div style={{ marginTop: 32, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>📱</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>Pay with Airtel Money</div>
              <div style={{ fontSize: 12, color: 'rgba(232,232,240,0.5)' }}>Send to our Airtel number · Submit transaction ID · Get activated in minutes via WhatsApp</div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 24px', maxWidth: 720, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6c63ff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#fff', letterSpacing: -1 }}>Common Questions</h2>
          </div>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s', borderColor: faqOpen === i ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)' }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#e8e8f0', fontSize: 14, fontWeight: 500, textAlign: 'left', gap: 12 }}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 18, color: '#6c63ff', flexShrink: 0, transition: 'transform 0.2s', transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '0 20px 18px', fontSize: 13, color: 'rgba(232,232,240,0.6)', lineHeight: 1.7 }}>{faq.a}</div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '80px 24px' }}>
        <FadeIn>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '60px 40px', borderRadius: 20, border: '1px solid rgba(108,99,255,0.3)', background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%), rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>
              Start Writing Smarter Today
            </div>
            <p style={{ fontSize: 16, color: 'rgba(232,232,240,0.5)', marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
              Free plan available. No credit card. Works on any device. Results in seconds.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{ padding: '14px 32px', background: '#6c63ff', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                Create free account →
              </Link>
              <Link href="/auth/login" style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.07)', color: '#e8e8f0', borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                Sign in
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 24px', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✦</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0' }}>Flow-Student</span>
          <span style={{ fontSize: 12, color: 'rgba(232,232,240,0.3)', marginLeft: 8 }}>AI Writing Suite · Zambia 🇿🇲</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'rgba(232,232,240,0.4)' }}>
          <Link href="/auth/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>
          <Link href="/auth/register" style={{ color: 'inherit', textDecoration: 'none' }}>Sign up</Link>
          <a href="mailto:support@flow-student.com" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { -webkit-tap-highlight-color: transparent; }
        @media (max-width: 640px) {
          nav > div:nth-child(2) { display: none; }
          section { padding: 60px 20px; }
        }
      `}</style>
    </div>
  )
}
