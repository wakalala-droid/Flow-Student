'use client'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import LineWaves from './LineWaves'

// ── TOOLS / STEPS / PLANS / FAQS DATA ────────────────────────────────────────
const TOOLS = [
  { icon: '✨', name: 'AI Humanizer',     desc: 'Makes AI text completely undetectable. Passes GPTZero, Turnitin, Winston AI.' },
  { icon: '🔍', name: 'AI Detector',      desc: 'Sentence-level heatmap shows exactly which parts read as AI-generated.' },
  { icon: '📋', name: 'Plagiarism Check', desc: 'Semantic comparison against billions of web sources and academic papers.' },
  { icon: '🔄', name: 'Paraphraser',      desc: '8 modes: Academic, Creative, Concise, SEO, Professional and more.' },
  { icon: '✅', name: 'Grammar Fix',      desc: 'Catches grammar, spelling, passive voice, clarity issues with one-click fixes.' },
  { icon: '🧾', name: 'Fact Checker',     desc: 'Extracts and verifies every factual claim with trusted sources.' },
  { icon: '📈', name: 'SEO Optimizer',    desc: 'Real-time scoring, keyword suggestions, meta descriptions and more.' },
  { icon: '🎭', name: 'Tone Rewriter',    desc: 'Switch between Professional, Academic, Casual, Gen Z and 4 more tones.' },
  { icon: '📚', name: 'Citations',        desc: 'Auto-generates APA, MLA, Chicago, Harvard from any source text.' },
]

const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Sign up free in 30 seconds. No credit card required. Google login available.', color: '#6c63ff', bg: 'rgba(108,99,255,0.08)' },
  { n: '02', title: 'Paste your text',     desc: 'Drop in your essay, assignment or article. Text stays saved as you switch tools.', color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  { n: '03', title: 'Pick your tool',      desc: 'Humanize, check grammar, detect AI, cite sources — all from one dashboard.', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  { n: '04', title: 'Get instant results', desc: 'Powered by Groq AI. Results in seconds, not minutes. Copy and use immediately.', color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
]

const PLANS = [
  { name: 'Free',    price: 'ZMW 0',  period: 'forever',    highlight: false, features: ['5,000 words/month','10 AI scans','All 9 tools','Email support'], cta: 'Get Started Free', href: '/auth/register' },
  { name: 'Student', price: 'ZMW 49', period: 'per month',  highlight: true,  features: ['20,000 words/month','50 AI scans','All tools unlimited','Plagiarism checks','Priority support'], cta: 'Start Student Plan', href: '/auth/register' },
  { name: 'Pro',     price: 'ZMW 99', period: 'per month',  highlight: false, features: ['50,000 words/month','200 AI scans','Document uploads','Export reports','API access'], cta: 'Go Pro', href: '/auth/register' },
]

const FAQS = [
  { q: 'Will my humanized text pass AI detectors?', a: 'Yes. Our humanizer is tested against GPTZero, Turnitin, Copyleaks, and Winston AI. The Undetectable mode applies 15 techniques including sentence burstiness, banned phrase removal, and forced variation.' },
  { q: 'How do I pay?', a: 'We accept Airtel Money directly to our number. After paying, submit your transaction ID and we activate your account within 15 minutes via WhatsApp.' },
  { q: 'Does my text stay private?', a: 'Yes. Your text is processed through our secure API and stored only in your personal account. We never use your content for training or share it with third parties.' },
  { q: 'Can I use it on my phone?', a: 'Absolutely. Flow-Student is fully optimized for mobile with a bottom navigation bar, tab switching, and touch-friendly controls. Works on any smartphone browser.' },
  { q: 'What AI model powers it?', a: 'We use Llama 3.3 70B via Groq — one of the fastest and most capable open models available. Results in seconds.' },
]


// ── SCROLL STACK STEPS ────────────────────────────────────────────────────────
function ScrollStackSteps() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardsRef    = useRef<HTMLElement[]>([])
  const animRef     = useRef<number>(0)

  const update = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller || !cardsRef.current.length) return
    const scrollTop  = scroller.scrollTop
    const viewH      = scroller.clientHeight
    const stackPos   = viewH * 0.2
    const stackGap   = 28
    const baseScale  = 0.88
    const scaleStep  = 0.03

    const endEl = scroller.querySelector('.ss-end') as HTMLElement
    const endTop = endEl ? endEl.offsetTop : 0

    cardsRef.current.forEach((card, i) => {
      if (!card) return
      const cardTop   = card.offsetTop
      const pinStart  = cardTop - stackPos - stackGap * i
      const pinEnd    = endTop - viewH / 2
      const scaleEnd  = cardTop - viewH * 0.1
      const scaleStart= cardTop - stackPos - stackGap * i

      const sp = Math.max(0, Math.min(1, (scrollTop - scaleStart) / Math.max(1, scaleEnd - scaleStart)))
      const tgt = baseScale + i * scaleStep
      const sc  = 1 - sp * (1 - tgt)

      let ty = 0
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        ty = scrollTop - cardTop + stackPos + stackGap * i
      } else if (scrollTop > pinEnd) {
        ty = pinEnd - cardTop + stackPos + stackGap * i
      }

      card.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) scale(${sc.toFixed(4)})`
    })
  }, [])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const cards = Array.from(scroller.querySelectorAll<HTMLElement>('.ss-card'))
    cardsRef.current = cards
    cards.forEach((c, i) => {
      if (i < cards.length - 1) c.style.marginBottom = '80px'
      c.style.transformOrigin = 'top center'
      c.style.willChange = 'transform'
    })
    scroller.addEventListener('scroll', update, { passive: true })
    update()
    return () => scroller.removeEventListener('scroll', update)
  }, [update])

  return (
    <div ref={scrollerRef} style={{ position: 'relative', width: '100%', height: '70vh', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' as 'touch' }}>
      <div style={{ padding: '15vh 0 40rem', maxWidth: 680, margin: '0 auto' }}>
        {STEPS.map((step, i) => (
          <div key={step.n} className="ss-card" style={{
            background: '#111118',
            border: `1px solid ${step.color}22`,
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: `0 0 40px ${step.color}11`,
            position: 'relative',
            boxSizing: 'border-box',
          }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: step.color, opacity: 0.15, lineHeight: 1, marginBottom: 8, letterSpacing: -3 }}>{step.n}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{step.title}</div>
            <div style={{ fontSize: 15, color: 'rgba(232,232,240,0.55)', lineHeight: 1.7 }}>{step.desc}</div>
            <div style={{ position: 'absolute', top: 28, right: 28, width: 40, height: 40, borderRadius: '50%', background: step.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {['🚀','📝','🛠','⚡'][i]}
            </div>
          </div>
        ))}
        <div className="ss-end" style={{ width: '100%', height: 1 }} />
      </div>
    </div>
  )
}

// ── FADE IN HOOK ──────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.12 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(22px)', transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// ── MAIN LANDING ──────────────────────────────────────────────────────────────
export default function Landing() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [cycle, setCycle]     = useState<'monthly' | 'yearly'>('monthly')
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    let frame: number, start = 0
    const target = 847293, dur = 2400
    const go = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / dur, 1)
      setWordCount(Math.floor(p * target))
      if (p < 1) frame = requestAnimationFrame(go)
    }
    const t = setTimeout(() => { frame = requestAnimationFrame(go) }, 600)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e8e8f0', fontFamily: 'system-ui,sans-serif', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(18px)', background: 'rgba(10,10,15,0.88)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>✦</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>Flow-Student</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(232,232,240,0.55)' }}>
          {['Features','How it works','Pricing','FAQ'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ color: 'inherit', textDecoration: 'none', transition: 'color .15s' }}
              onMouseOver={e=>(e.currentTarget.style.color='#e8e8f0')}
              onMouseOut={e=>(e.currentTarget.style.color='rgba(232,232,240,0.55)')}>{l}</a>
          ))}
        </div>
        <Link href="/auth/register" style={{ padding: '8px 18px', background: '#6c63ff', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          Get started free →
        </Link>
      </nav>

      {/* ── HERO with LineWaves ── */}
      <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 0', textAlign: 'center', overflow: 'hidden' }}>

        {/* ── LineWaves — exact props as specified, hero only ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <LineWaves
            speed={0.1}
            innerLineCount={40}
            outerLineCount={34}
            warpIntensity={1}
            rotation={-144}
            edgeFadeWidth={0}
            colorCycleSpeed={0.2}
            brightness={0.2}
            color1="#A855F7"
            color2="#7C3AED"
            color3="#ffffff"
            enableMouseInteraction
            mouseInfluence={0.9}
          />
        </div>

        {/* Graceful dark fade at bottom — lets features section appear cleanly */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,15,0.6) 50%, #0a0a0f 100%)', zIndex: 1, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 780 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(108,99,255,0.35)', background: 'rgba(108,99,255,0.1)', fontSize: 12, color: '#a78bfa', marginBottom: 32, fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'blink 2s ease infinite' }} />
            For students in Zambia and beyond
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 78px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: -2.5, marginBottom: 24, color: '#fff' }}>
            Write Smarter.{' '}
            <span style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Stay Undetected.
            </span>
            <br />Pass Every Time.
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(232,232,240,0.55)', lineHeight: 1.75, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            The all-in-one AI writing suite that humanizes text, checks grammar, detects AI, verifies facts, and generates citations — in seconds.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
            <Link href="/auth/register" style={{ padding: '14px 30px', background: '#6c63ff', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Start for free →</Link>
            <a href="#how-it-works" style={{ padding: '14px 30px', background: 'rgba(255,255,255,0.06)', color: '#e8e8f0', borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>See how it works</a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { v: `${wordCount.toLocaleString()}+`, l: 'Words humanized' },
              { v: '9', l: 'AI tools in one' },
              { v: '< 3s', l: 'Average response' },
              { v: '97%', l: 'Human score avg' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#a78bfa', letterSpacing: -1 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,232,240,0.35)', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOL MARQUEE ── */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 0', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ display: 'flex', gap: 28, animation: 'marquee 22s linear infinite', width: 'max-content' }}>
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', whiteSpace: 'nowrap', fontSize: 12, color: 'rgba(232,232,240,0.4)' }}>
              <span>{t.icon}</span>{t.name}
            </div>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, overflow: 'hidden', background: '#111118', boxShadow: '0 0 100px rgba(108,99,255,0.07)' }}>
            <div style={{ background: '#0d0d14', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#f87171','#fb923c','#34d399'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(232,232,240,0.3)', textAlign: 'center', maxWidth: 280, margin: '0 auto' }}>
                flow-student.vercel.app/dashboard
              </div>
            </div>
            <div style={{ display: 'flex', minHeight: 320 }}>
              <div style={{ width: 170, borderRight: '1px solid rgba(255,255,255,0.07)', padding: '14px 10px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18, padding: '0 4px' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>✦</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#e8e8f0' }}>Flow-Student</span>
                </div>
                {TOOLS.slice(0, 6).map((t, i) => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 6, marginBottom: 2, background: i === 0 ? 'rgba(108,99,255,0.18)' : 'transparent', color: i === 0 ? '#a78bfa' : 'rgba(232,232,240,0.35)', fontSize: 10 }}>
                    <span style={{ fontSize: 12 }}>{t.icon}</span>{t.name}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 18 }}>
                <div style={{ display: 'flex', gap: 12, height: '100%' }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(232,232,240,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Input</div>
                    <div style={{ fontSize: 11, color: 'rgba(232,232,240,0.45)', lineHeight: 1.7 }}>The implementation of artificial intelligence technologies has demonstrated significant potential in optimizing various operational processes within educational institutions...</div>
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ padding: '4px 10px', background: '#6c63ff', borderRadius: 5, fontSize: 9, color: '#fff', fontWeight: 700 }}>▶ Humanize</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(232,232,240,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>Output</span>
                      <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(52,211,153,0.15)', color: '#34d399', borderRadius: 4, fontWeight: 700 }}>94% Human</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(232,232,240,0.65)', lineHeight: 1.7 }}>AI in education has real promise — but the way it gets talked about often misses the point. In practice, what matters is whether students are actually learning better...</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {['✓ Undetectable','Burstiness ↑','Perplexity 78'].map(b => (
                        <span key={b} style={{ fontSize: 9, padding: '2px 5px', background: 'rgba(108,99,255,0.15)', color: '#a78bfa', borderRadius: 4 }}>{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '60px 24px 80px', maxWidth: 1080, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6c63ff', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>9 Tools in One</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff', letterSpacing: -1.5, marginBottom: 14 }}>Everything You Need to Write Better</h2>
            <p style={{ fontSize: 15, color: 'rgba(232,232,240,0.45)', maxWidth: 480, margin: '0 auto' }}>One platform. All the AI writing tools students actually need.</p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14 }}>
          {TOOLS.map((tool, i) => (
            <FadeIn key={tool.name} delay={i * 55}>
              <div style={{ padding: '22px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 14, transition: 'border-color .2s,background .2s', cursor: 'default' }}
                onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='rgba(108,99,255,0.38)';(e.currentTarget as HTMLDivElement).style.background='rgba(108,99,255,0.05)'}}
                onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,0.065)';(e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.025)'}}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{tool.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e8e8f0', marginBottom: 6 }}>{tool.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,232,240,0.45)', lineHeight: 1.65 }}>{tool.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS — ScrollStack ── */}
      <section id="how-it-works" style={{ padding: '60px 24px 0', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6c63ff', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>Simple Steps</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff', letterSpacing: -1.5, marginBottom: 8 }}>Up and Running in 60 Seconds</h2>
            <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.4)', marginBottom: 0 }}>Scroll to see each step</p>
          </div>
        </FadeIn>
        <ScrollStackSteps />
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: 980, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6c63ff', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>Pricing Plans</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff', letterSpacing: -1.5, marginBottom: 14 }}>Affordable for Every Student</h2>
            <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.45)', marginBottom: 24 }}>Paid via Airtel Money. Activated in minutes.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['monthly','yearly'] as const).map(c => (
                <button key={c} onClick={() => setCycle(c)}
                  style={{ padding: '7px 18px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: cycle === c ? '#6c63ff' : 'transparent', color: cycle === c ? '#fff' : 'rgba(232,232,240,0.45)', transition: 'all .2s' }}>
                  {c === 'monthly' ? 'Monthly' : 'Yearly (save 2mo)'}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 75}>
              <div style={{ padding: 26, border: plan.highlight ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.065)', borderRadius: 16, background: plan.highlight ? 'rgba(108,99,255,0.07)' : 'rgba(255,255,255,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', background: '#6c63ff', borderRadius: 20, fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Most Popular</div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ marginBottom: 18 }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: -1.5 }}>
                    {cycle === 'yearly' && plan.name !== 'Free' ? `ZMW ${parseInt(plan.price.replace('ZMW ','')) * 10}` : plan.price}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(232,232,240,0.35)', marginLeft: 4 }}>/{cycle === 'yearly' ? 'year' : plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'rgba(232,232,240,0.55)', marginBottom: 8 }}>
                      <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{ display: 'block', textAlign: 'center', padding: 11, borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', background: plan.highlight ? '#6c63ff' : 'rgba(255,255,255,0.07)', color: plan.highlight ? '#fff' : '#e8e8f0', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                  {plan.cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={180}>
          <div style={{ marginTop: 28, padding: '18px 22px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18 }}>📱</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }}>Pay with Airtel Money</div>
              <div style={{ fontSize: 11, color: 'rgba(232,232,240,0.4)' }}>Send to our Airtel number · Submit transaction ID · Get activated in minutes via WhatsApp</div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '60px 24px 80px', maxWidth: 700, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6c63ff', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: '#fff', letterSpacing: -1 }}>Common Questions</h2>
          </div>
        </FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 55}>
              <div style={{ border: `1px solid ${faqOpen === i ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: '100%', padding: '17px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#e8e8f0', fontSize: 14, fontWeight: 600, textAlign: 'left', gap: 12 }}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 20, color: '#6c63ff', flexShrink: 0, transition: 'transform .2s', transform: faqOpen === i ? 'rotate(45deg)' : 'none', display: 'inline-block' }}>+</span>
                </button>
                {faqOpen === i && <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'rgba(232,232,240,0.55)', lineHeight: 1.75 }}>{faq.a}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '60px 24px 80px' }}>
        <FadeIn>
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', padding: '56px 40px', borderRadius: 22, border: '1px solid rgba(108,99,255,0.28)', background: 'radial-gradient(ellipse at 50% 0%,rgba(108,99,255,0.11) 0%,transparent 70%),rgba(255,255,255,0.015)' }}>
            <div style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#fff', letterSpacing: -1.5, marginBottom: 14 }}>Start Writing Smarter Today</div>
            <p style={{ fontSize: 15, color: 'rgba(232,232,240,0.45)', marginBottom: 34 }}>Free plan available. No credit card. Works on any device.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{ padding: '13px 30px', background: '#6c63ff', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Create free account →</Link>
              <Link href="/auth/login" style={{ padding: '13px 30px', background: 'rgba(255,255,255,0.06)', color: '#e8e8f0', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>Sign in</Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '32px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✦</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }}>Flow-Student</span>
          <span style={{ fontSize: 11, color: 'rgba(232,232,240,0.3)', marginLeft: 6 }}>AI Writing Suite · Zambia 🇿🇲</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'rgba(232,232,240,0.35)' }}>
          <Link href="/auth/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>
          <Link href="/auth/register" style={{ color: 'inherit', textDecoration: 'none' }}>Sign up</Link>
          <a href="mailto:support@flow-student.com" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>

      <style>{`
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        a{-webkit-tap-highlight-color:transparent}
        @media(max-width:640px){
          nav>div:nth-child(2){display:none}
          section{padding:50px 18px}
        }
      `}</style>
    </div>
  )
}
