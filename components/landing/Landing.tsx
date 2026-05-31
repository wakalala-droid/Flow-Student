'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import LineWaves from './LineWaves'

// ── DATA ─────────────────────────────────────────────────────────────────────
const TOOLS = [
  { icon: 'sparkles', name: 'AI Humanizer',     desc: 'Makes AI text completely undetectable. Passes GPTZero, Turnitin, Winston AI.' },
  { icon: 'search',   name: 'AI Detector',      desc: 'Sentence-level heatmap shows exactly which parts read as AI-generated.' },
  { icon: 'clipboard',name: 'Plagiarism Check', desc: 'Semantic comparison against billions of web sources and academic papers.' },
  { icon: 'refresh',  name: 'Paraphraser',      desc: '8 modes: Academic, Creative, Concise, SEO, Professional and more.' },
  { icon: 'check',    name: 'Grammar Fix',       desc: 'Catches grammar, spelling, passive voice, clarity issues with one-click fixes.' },
  { icon: 'shield',   name: 'Fact Checker',      desc: 'Extracts and verifies every factual claim with trusted sources.' },
  { icon: 'trending', name: 'SEO Optimizer',     desc: 'Real-time scoring, keyword suggestions, meta descriptions and more.' },
  { icon: 'mic',      name: 'Tone Rewriter',     desc: 'Switch between Professional, Academic, Casual, Gen Z and 4 more tones.' },
  { icon: 'book',     name: 'Citations',          desc: 'Auto-generates APA, MLA, Chicago, Harvard from any source text.' },
]

const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Sign up free in 30 seconds. No credit card required. Google login available.', color: '#a855f7', accent: 'rgba(168,85,247,0.15)', glow: 'rgba(168,85,247,0.25)' },
  { n: '02', title: 'Paste your text',     desc: 'Drop in your essay, assignment or article. Text stays saved as you switch tools.', color: '#34d399', accent: 'rgba(52,211,153,0.12)', glow: 'rgba(52,211,153,0.2)' },
  { n: '03', title: 'Pick your tool',      desc: 'Humanize, check grammar, detect AI, cite sources — all from one dashboard.', color: '#60a5fa', accent: 'rgba(96,165,250,0.12)', glow: 'rgba(96,165,250,0.2)' },
  { n: '04', title: 'Get instant results', desc: 'Powered by Groq AI. Results in seconds, not minutes. Copy and use immediately.', color: '#fb923c', accent: 'rgba(251,146,60,0.12)', glow: 'rgba(251,146,60,0.2)' },
]

const STEP_ICONS = [
  <svg key="a" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.819m2.562-5.84a14.927 14.927 0 00-2.561 6.176m0 0a6 6 0 005.842 7.38m0 0a6 6 0 007.382-5.841m0 0a14.927 14.927 0 00-2.561-6.176" /></svg>,
  <svg key="b" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>,
  <svg key="c" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  <svg key="d" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
]

const TOOL_ICONS: Record<string, JSX.Element> = {
  sparkles: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>,
  search:   <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" /></svg>,
  clipboard:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75m0-3H12" /></svg>,
  refresh:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  check:    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  shield:   <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25 4.5-4.5m0 0A9 9 0 1112 3c2.395 0 4.575.876 6.228 2.317" /></svg>,
  trending: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
  mic:      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>,
  book:     <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
}

const PLANS = [
  { name:'Free',    price:'ZMW 0',  period:'forever',   highlight:false, features:['5,000 words/month','10 AI scans','All 9 tools','Email support'], cta:'Get Started Free', href:'/auth/register' },
  { name:'Student', price:'ZMW 49', period:'per month', highlight:true,  features:['20,000 words/month','50 AI scans','All tools unlimited','Plagiarism checks','Priority support'], cta:'Start Student Plan', href:'/auth/register' },
  { name:'Pro',     price:'ZMW 99', period:'per month', highlight:false, features:['50,000 words/month','200 AI scans','Document uploads','Export reports','API access'], cta:'Go Pro', href:'/auth/register' },
]

const FAQS = [
  { q:'Will my humanized text pass AI detectors?', a:'Yes. Our humanizer is tested against GPTZero, Turnitin, Copyleaks, and Winston AI. The Undetectable mode applies 15 techniques including sentence burstiness, banned phrase removal, and forced variation.' },
  { q:'How do I pay?', a:'We accept Airtel Money directly to our number. After paying, submit your transaction ID and we activate your account within 15 minutes via WhatsApp.' },
  { q:'Does my text stay private?', a:'Yes. Your text is processed through our secure API and stored only in your personal account. We never use your content for training or share it with third parties.' },
  { q:'Can I use it on my phone?', a:'Absolutely. Flow-Student is fully optimized for mobile with a bottom navigation bar, tab switching, and touch-friendly controls. Works on any smartphone browser.' },
  { q:'What AI model powers it?', a:'We use Llama 3.3 70B via Groq — one of the fastest and most capable open models available. Results in seconds.' },
]

// ── CASSIS-STYLE NAV — pills on scroll down, full on scroll up ───────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastY.current
      // Pill when scrolled down past 60px; full when scrolling back up or at top
      if (y < 60) setScrolled(false)
      else if (goingDown) setScrolled(true)
      else setScrolled(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 100,
      display: 'flex', justifyContent: 'center',
      padding: scrolled ? '10px 16px' : '0',
      transition: 'padding .4s cubic-bezier(.4,0,.2,1)',
      pointerEvents: 'none',
    }}>
      <nav style={{
        display: 'flex', alignItems: 'center', gap: 0,
        width: scrolled ? 'auto' : '100%',
        maxWidth: scrolled ? 740 : '100%',
        height: 58,
        padding: scrolled ? '0 8px 0 16px' : '0 24px',
        borderRadius: scrolled ? 999 : 0,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: scrolled
          ? 'rgba(15,10,30,0.85)'
          : 'rgba(10,10,15,0.6)',
        border: scrolled
          ? '1px solid rgba(168,85,247,0.2)'
          : 'none',
        borderBottom: scrolled ? undefined : '1px solid rgba(255,255,255,0.07)',
        boxShadow: scrolled ? '0 4px 32px rgba(124,58,237,0.15), 0 1px 0 rgba(255,255,255,0.05) inset' : 'none',
        transition: 'all .4s cubic-bezier(.4,0,.2,1)',
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginRight:'auto', flexShrink:0 }}>
          <img src='data:image/png;base64,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' alt='Flow-Student' width={34} height={34} style={{ borderRadius:10, flexShrink:0, boxShadow: scrolled ? '0 0 14px rgba(168,85,247,0.5)' : 'none', transition:'box-shadow .4s' }} />
          <span style={{ fontWeight:800, fontSize:14, letterSpacing:-0.3, background:'linear-gradient(135deg,#e8e8f0,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', whiteSpace:'nowrap' }}>
            Flow-Student
          </span>
        </Link>

        {/* Links — hide on mobile */}
        <div style={{ display:'flex', alignItems:'center', gap:2, margin:'0 12px' }} className="nav-links">
          {['Features','How it works','Pricing','FAQ'].map((l, i) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              style={{ color:'rgba(232,232,240,0.55)', textDecoration:'none', fontSize:13, fontWeight:500, padding:'6px 11px', borderRadius:8, transition:'all .15s', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
              {scrolled && <span style={{ fontSize:10, color:'rgba(168,85,247,0.5)', fontWeight:700 }}>0{i+1}</span>}
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link href="/auth/register" style={{
          padding: scrolled ? '7px 16px' : '8px 18px',
          background: 'rgba(124,58,237,0.9)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          borderRadius: scrolled ? 999 : 9,
          fontSize: 13, fontWeight: 700,
          textDecoration: 'none',
          border: '1px solid rgba(167,139,250,0.3)',
          boxShadow: '0 0 18px rgba(124,58,237,0.3)',
          transition: 'all .4s cubic-bezier(.4,0,.2,1)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Get started →
        </Link>
      </nav>

      <style>{`
        @media(max-width:640px){ .nav-links { display:none !important; } }
      `}</style>
    </div>
  )
}

// ── SCROLL STACK — fixed 4th card, purple mesh background ────────────────────
function ScrollStackSteps() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef   = useRef<(HTMLDivElement|null)[]>([])

  useEffect(() => {
    // Store each card's natural offsetTop relative to section
    const offsets: number[] = []

    function init() {
      const section = sectionRef.current
      if (!section) return
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        // Reset transform first so we measure natural position
        card.style.transform = 'none'
        offsets[i] = section.getBoundingClientRect().top + window.scrollY + card.offsetTop
      })
    }

    function update() {
      const section = sectionRef.current
      if (!section || !offsets.length) return

      const scrollY   = window.scrollY
      const viewH     = window.innerHeight
      const stackGap  = 20   // px between stacked cards
      const pinOffset = 80   // distance from top of viewport to pin position

      // Section exit point — where the LAST card's bottom leaves viewport
      const lastCard = cardsRef.current[STEPS.length - 1]
      const sectionBottom = lastCard
        ? offsets[STEPS.length - 1] + lastCard.offsetHeight
        : 0

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        const rawTop   = offsets[i]
        const pinStart = rawTop - pinOffset - stackGap * i
        // Each card unpins when section scrolls past — NO permanent stick
        const pinEnd   = sectionBottom - viewH + stackGap * (STEPS.length - 1 - i)

        // Scale: cards behind get smaller
        const behindCount = Math.max(0,
          cardsRef.current.slice(i + 1).filter(c => {
            if (!c || !offsets[i + 1]) return false
            const idx = cardsRef.current.indexOf(c)
            return scrollY >= (offsets[idx] - pinOffset - stackGap * idx)
          }).length
        )
        const scale = Math.max(0.88, 1 - behindCount * 0.03)

        let ty = 0
        if (scrollY >= pinStart && scrollY < pinEnd) {
          ty = scrollY - rawTop + pinOffset + stackGap * i
        } else if (scrollY >= pinEnd) {
          // Unpin — card scrolls away naturally with page
          ty = pinEnd - rawTop + pinOffset + stackGap * i
        }

        card.style.transform  = `translate3d(0,${Math.round(ty)}px,0) scale(${scale.toFixed(4)})`
        card.style.zIndex     = String(i + 1)
      })
    }

    // Small delay so layout is ready
    const t = setTimeout(init, 100)
    window.addEventListener('scroll', update, { passive:true })
    window.addEventListener('resize', () => { init(); update() }, { passive:true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <div style={{ position:'relative', padding:'0 24px 60px' }}>
      {/* Cards container */}
      <div ref={sectionRef} style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            ref={el => { cardsRef.current[i] = el }}
            style={{
              position: 'relative',
              marginBottom: i < STEPS.length - 1 ? 120 : 0,
              transformOrigin: 'top center',
              willChange: 'transform',
            }}
          >
            {/* Glassmorphism card */}
            <div style={{
              background: 'rgba(18,12,40,0.72)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: `1px solid ${step.color}28`,
              borderTop: `1px solid ${step.color}45`,
              borderRadius: 24,
              padding: '36px 32px',
              boxShadow: [
                `0 0 0 1px rgba(255,255,255,0.04)`,
                `0 20px 60px rgba(0,0,0,0.4)`,
                `0 0 60px ${step.glow}`,
                `inset 0 1px 0 rgba(255,255,255,0.07)`,
              ].join(', '),
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Inner light streak — glassmorphism highlight */}
              <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:1, background:`linear-gradient(90deg, transparent, ${step.color}60, transparent)`, borderRadius:1 }} />

              {/* Ghost step number */}
              <div style={{ position:'absolute', top:12, right:24, fontSize:80, fontWeight:900, color:step.color, opacity:0.07, lineHeight:1, letterSpacing:-5, userSelect:'none', pointerEvents:'none' }}>{step.n}</div>

              {/* Icon badge */}
              <div style={{ width:46, height:46, borderRadius:13, background:`linear-gradient(135deg, ${step.accent}, rgba(0,0,0,0))`, border:`1px solid ${step.color}35`, display:'flex', alignItems:'center', justifyContent:'center', color:step.color, marginBottom:20, boxShadow:`0 0 20px ${step.glow}` }}>
                {STEP_ICONS[i]}
              </div>

              <div style={{ fontSize:21, fontWeight:800, color:'#fff', marginBottom:8, letterSpacing:-0.5 }}>{step.title}</div>
              <div style={{ fontSize:14, color:'rgba(232,232,240,0.5)', lineHeight:1.75 }}>{step.desc}</div>

              {/* Progress indicators */}
              <div style={{ display:'flex', gap:6, marginTop:24, alignItems:'center' }}>
                {STEPS.map((_, j) => (
                  <div key={j} style={{ height:3, borderRadius:2, background: j === i ? step.color : 'rgba(255,255,255,0.1)', width: j === i ? 28 : 8, transition:'width .3s, background .3s', boxShadow: j === i ? `0 0 8px ${step.color}` : 'none' }} />
                ))}
                <span style={{ marginLeft:'auto', fontSize:11, color:`${step.color}99`, fontWeight:600 }}>{step.n} / 04</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── COUNT UP ──────────────────────────────────────────────────────────────────
function CountUp({ target, suffix='', duration=1800 }: { target:number; suffix?:string; duration?:number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold:0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let frame: number, t0 = 0
    const go = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1-p, 3)) * target))
      if (p < 1) frame = requestAnimationFrame(go)
    }
    frame = requestAnimationFrame(go)
    return () => cancelAnimationFrame(frame)
  }, [started, target, duration])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ── FADE IN ───────────────────────────────────────────────────────────────────
function FadeIn({ children, delay=0 }: { children:React.ReactNode; delay?:number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold:0.1 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])
  return <div ref={ref} style={{ opacity:v?1:0, transform:v?'translateY(0)':'translateY(22px)', transition:`opacity .6s ease ${delay}ms,transform .6s ease ${delay}ms` }}>{children}</div>
}

function Label({ children }: { children:React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold:0.5 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])
  return <div ref={ref} style={{ fontSize:11, fontWeight:700, color:'#7c3aed', letterSpacing:3, textTransform:'uppercase', marginBottom:14, opacity:v?1:0, transform:v?'translateY(0)':'translateY(10px)', transition:'opacity .5s,transform .5s' }}>{children}</div>
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [faqOpen, setFaqOpen] = useState<number|null>(null)
  const [cycle, setCycle] = useState<'monthly'|'yearly'>('monthly')

  return (
    <div style={{ background:'#0a0a0f', minHeight:'100vh', color:'#e8e8f0', fontFamily:'system-ui,sans-serif', overflowX:'hidden' }}>

      <Nav />

      {/* ── HERO ── */}
      <section style={{ position:'relative', minHeight:'92vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'100px 24px 0', textAlign:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <LineWaves speed={0.1} innerLineCount={40} outerLineCount={34} warpIntensity={1} rotation={-144} edgeFadeWidth={0} colorCycleSpeed={0.2} brightness={0.2} color1="#A855F7" color2="#7C3AED" color3="#ffffff" enableMouseInteraction mouseInfluence={0.9} />
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:320, background:'linear-gradient(to bottom,transparent 0%,rgba(10,10,15,0.75) 55%,#0a0a0f 100%)', zIndex:1, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2, maxWidth:800 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:20, border:'1px solid rgba(124,58,237,0.35)', background:'rgba(124,58,237,0.1)', backdropFilter:'blur(8px)', fontSize:12, color:'#a78bfa', marginBottom:32, fontWeight:500 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block', animation:'blink 2s ease infinite' }} />
            For students in Zambia and beyond
          </div>

          <h1 style={{ fontSize:'clamp(40px,7vw,82px)', fontWeight:900, lineHeight:1.04, letterSpacing:-3, marginBottom:24, color:'#fff' }}>
            Write Smarter.{' '}
            <span style={{ background:'linear-gradient(135deg,#a855f7,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Stay Undetected.</span>
            <br/>Pass Every Time.
          </h1>

          <p style={{ fontSize:18, color:'rgba(232,232,240,0.55)', lineHeight:1.75, marginBottom:40, maxWidth:560, margin:'0 auto 40px' }}>
            The all-in-one AI writing suite that humanizes text, checks grammar, detects AI, verifies facts, and generates citations — in seconds.
          </p>

          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:72 }}>
            <Link href="/auth/register" style={{ padding:'15px 32px', background:'#7c3aed', color:'#fff', borderRadius:14, fontSize:16, fontWeight:700, textDecoration:'none', boxShadow:'0 0 32px rgba(124,58,237,0.45)', border:'1px solid rgba(167,139,250,0.2)' }}>Start for free →</Link>
            <a href="#how-it-works" style={{ padding:'15px 32px', background:'rgba(255,255,255,0.07)', color:'#e8e8f0', borderRadius:14, fontSize:16, fontWeight:600, textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(8px)' }}>See how it works</a>
          </div>

          {/* Animated stats */}
          <div style={{ display:'flex', gap:48, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { v:<CountUp target={847293} suffix="+" />, l:'Words humanized' },
              { v:<CountUp target={9} />,                l:'AI tools in one' },
              { v:'< 3s',                                l:'Average response' },
              { v:<><CountUp target={97} suffix="%" /></>, l:'Human score avg' },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:900, letterSpacing:-2, color:'#a78bfa', lineHeight:1, marginBottom:6 }}>{s.v}</div>
                <div style={{ fontSize:12, color:'rgba(232,232,240,0.4)', fontWeight:500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ overflow:'hidden', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'14px 0', background:'rgba(255,255,255,0.015)' }}>
        <div style={{ display:'flex', gap:28, animation:'marquee 22s linear infinite', width:'max-content' }}>
          {[...TOOLS,...TOOLS].map((t,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 14px', whiteSpace:'nowrap', fontSize:12, color:'rgba(232,232,240,0.4)' }}>
              <span style={{ color:'rgba(167,139,250,0.6)', display:'inline-flex', flexShrink:0 }}>{TOOL_ICONS[t.icon]}</span>{t.name}
            </div>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding:'80px 24px', maxWidth:1080, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ border:'1px solid rgba(255,255,255,0.09)', borderRadius:18, overflow:'hidden', background:'#111118', boxShadow:'0 0 100px rgba(124,58,237,0.07)' }}>
            <div style={{ background:'#0d0d14', padding:'10px 16px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display:'flex', gap:6 }}>{['#f87171','#fb923c','#34d399'].map(c=><div key={c} style={{ width:10,height:10,borderRadius:'50%',background:c,opacity:0.7 }}/>)}</div>
              <div style={{ flex:1, background:'rgba(255,255,255,0.05)', borderRadius:6, padding:'4px 12px', fontSize:11, color:'rgba(232,232,240,0.3)', textAlign:'center', maxWidth:280, margin:'0 auto' }}>flow-student.vercel.app/dashboard</div>
            </div>
            <div style={{ display:'flex', minHeight:300 }}>
              <div style={{ width:165, borderRight:'1px solid rgba(255,255,255,0.07)', padding:'14px 10px', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:18 }}>
                  <div style={{ width:20,height:20,borderRadius:5,background:'linear-gradient(135deg,#7c3aed,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>✦</div>
                  <span style={{ fontSize:10,fontWeight:700,color:'#e8e8f0' }}>Flow-Student</span>
                </div>
                {TOOLS.slice(0,6).map((t,i)=>(
                  <div key={t.name} style={{ display:'flex',alignItems:'center',gap:7,padding:'6px 8px',borderRadius:6,marginBottom:2,background:i===0?'rgba(124,58,237,0.18)':'transparent',color:i===0?'#a78bfa':'rgba(232,232,240,0.35)',fontSize:10 }}>
                    <span style={{ width:12,height:12,flexShrink:0,display:'inline-flex',color:i===0?'#a78bfa':'rgba(232,232,240,0.3)' }}>{TOOL_ICONS[t.icon]}</span>{t.name}
                  </div>
                ))}
              </div>
              <div style={{ flex:1, padding:18 }}>
                <div style={{ display:'flex', gap:12, height:'100%' }}>
                  <div style={{ flex:1,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:12 }}>
                    <div style={{ fontSize:9,fontWeight:700,color:'rgba(232,232,240,0.3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8 }}>Input</div>
                    <div style={{ fontSize:11,color:'rgba(232,232,240,0.45)',lineHeight:1.7 }}>The implementation of artificial intelligence technologies has demonstrated significant potential in optimizing various operational processes...</div>
                    <div style={{ marginTop:12,display:'flex',justifyContent:'flex-end' }}>
                      <div style={{ padding:'4px 10px',background:'#7c3aed',borderRadius:5,fontSize:9,color:'#fff',fontWeight:700 }}>▶ Humanize</div>
                    </div>
                  </div>
                  <div style={{ flex:1,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(52,211,153,0.18)',borderRadius:10,padding:12 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                      <span style={{ fontSize:9,fontWeight:700,color:'rgba(232,232,240,0.3)',textTransform:'uppercase',letterSpacing:1 }}>Output</span>
                      <span style={{ fontSize:9,padding:'2px 6px',background:'rgba(52,211,153,0.15)',color:'#34d399',borderRadius:4,fontWeight:700 }}>94% Human</span>
                    </div>
                    <div style={{ fontSize:11,color:'rgba(232,232,240,0.65)',lineHeight:1.7 }}>AI in education has real promise — but the way it gets talked about often misses the point. In practice, what matters is whether students are actually learning better...</div>
                    <div style={{ marginTop:8,display:'flex',gap:5,flexWrap:'wrap' }}>
                      {['✓ Undetectable','Burstiness ↑','Perplexity 78'].map(b=>(
                        <span key={b} style={{ fontSize:9,padding:'2px 5px',background:'rgba(124,58,237,0.15)',color:'#a78bfa',borderRadius:4 }}>{b}</span>
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
      <section id="features" style={{ padding:'60px 24px 80px', maxWidth:1080, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <Label>9 Tools in One</Label>
            <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:800, color:'#fff', letterSpacing:-1.5, marginBottom:14 }}>Everything You Need to Write Better</h2>
            <p style={{ fontSize:15, color:'rgba(232,232,240,0.45)', maxWidth:480, margin:'0 auto' }}>One platform. All the AI writing tools students actually need.</p>
          </div>
        </FadeIn>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:14 }}>
          {TOOLS.map((tool,i) => (
            <FadeIn key={tool.name} delay={i*55}>
              <div style={{ padding:'22px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:14, transition:'border-color .2s,background .2s,transform .2s', cursor:'default' }}
                onMouseOver={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='rgba(124,58,237,0.4)';d.style.background='rgba(124,58,237,0.06)';d.style.transform='translateY(-2px)'}}
                onMouseOut={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='rgba(255,255,255,0.065)';d.style.background='rgba(255,255,255,0.025)';d.style.transform='translateY(0)'}}>
                <div style={{ width:40,height:40,borderRadius:10,background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#a78bfa',marginBottom:12 }}>
                  {TOOL_ICONS[tool.icon]}
                </div>
                <div style={{ fontSize:14,fontWeight:700,color:'#e8e8f0',marginBottom:6 }}>{tool.name}</div>
                <div style={{ fontSize:12,color:'rgba(232,232,240,0.45)',lineHeight:1.65 }}>{tool.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ position:'relative', overflow:'hidden' }}>
        {/* Purple mesh background fills entire section */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(124,58,237,0.22) 0%, rgba(168,85,247,0.08) 50%, transparent 100%)', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 80% at 20% 60%, rgba(96,165,250,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.05 }} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="g2" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(168,85,247,1)" strokeWidth="0.5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#g2)" />
          </svg>
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <FadeIn>
            <div style={{ textAlign:'center', padding:'56px 24px 32px' }}>
              <Label>Simple Steps</Label>
              <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:800, color:'#fff', letterSpacing:-1.5, marginBottom:8 }}>Up and Running in 60 Seconds</h2>
              <p style={{ fontSize:14, color:'rgba(232,232,240,0.4)' }}>Scroll through each step below</p>
            </div>
          </FadeIn>
          <ScrollStackSteps />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:'80px 24px', maxWidth:980, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <Label>Pricing Plans</Label>
            <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:800, color:'#fff', letterSpacing:-1.5, marginBottom:14 }}>Affordable for Every Student</h2>
            <p style={{ fontSize:14, color:'rgba(232,232,240,0.45)', marginBottom:24 }}>Paid via Airtel Money. Activated in minutes.</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:4, background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)' }}>
              {(['monthly','yearly'] as const).map(c=>(
                <button key={c} onClick={()=>setCycle(c)} style={{ padding:'7px 18px',borderRadius:7,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:cycle===c?'#7c3aed':'transparent',color:cycle===c?'#fff':'rgba(232,232,240,0.45)',transition:'all .2s' }}>
                  {c==='monthly'?'Monthly':'Yearly (save 2mo)'}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:18 }}>
          {PLANS.map((plan,i)=>(
            <FadeIn key={plan.name} delay={i*75}>
              <div style={{ padding:26,border:plan.highlight?'1px solid rgba(124,58,237,0.5)':'1px solid rgba(255,255,255,0.065)',borderRadius:16,background:plan.highlight?'rgba(124,58,237,0.07)':'rgba(255,255,255,0.02)',position:'relative',display:'flex',flexDirection:'column',height:'100%' }}>
                {plan.highlight&&<div style={{ position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',padding:'4px 14px',background:'#7c3aed',borderRadius:20,fontSize:10,fontWeight:700,color:'#fff',whiteSpace:'nowrap' }}>Most Popular</div>}
                <div style={{ fontSize:14,fontWeight:700,color:'#e8e8f0',marginBottom:4 }}>{plan.name}</div>
                <div style={{ marginBottom:18 }}>
                  <span style={{ fontSize:34,fontWeight:800,color:'#fff',letterSpacing:-1.5 }}>{cycle==='yearly'&&plan.name!=='Free'?`ZMW ${parseInt(plan.price.replace('ZMW ',''))*10}`:plan.price}</span>
                  <span style={{ fontSize:12,color:'rgba(232,232,240,0.35)',marginLeft:4 }}>/{cycle==='yearly'?'year':plan.period}</span>
                </div>
                <ul style={{ listStyle:'none',padding:0,margin:'0 0 22px',flex:1 }}>
                  {plan.features.map(f=>(
                    <li key={f} style={{ display:'flex',gap:8,fontSize:12,color:'rgba(232,232,240,0.55)',marginBottom:8 }}>
                      <span style={{ color:'#34d399',flexShrink:0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{ display:'block',textAlign:'center',padding:11,borderRadius:9,fontSize:13,fontWeight:700,textDecoration:'none',background:plan.highlight?'#7c3aed':'rgba(255,255,255,0.07)',color:plan.highlight?'#fff':'#e8e8f0',border:plan.highlight?'none':'1px solid rgba(255,255,255,0.1)' }}>{plan.cta}</Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:'60px 24px 80px', maxWidth:700, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <Label>FAQ</Label>
            <h2 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:800, color:'#fff', letterSpacing:-1 }}>Common Questions</h2>
          </div>
        </FadeIn>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {FAQS.map((faq,i)=>(
            <FadeIn key={i} delay={i*55}>
              <div style={{ border:`1px solid ${faqOpen===i?'rgba(124,58,237,0.4)':'rgba(255,255,255,0.07)'}`,borderRadius:12,overflow:'hidden',transition:'border-color .2s' }}>
                <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%',padding:'17px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'transparent',border:'none',cursor:'pointer',color:'#e8e8f0',fontSize:14,fontWeight:600,textAlign:'left',gap:12 }}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize:20,color:'#7c3aed',flexShrink:0,transition:'transform .2s',transform:faqOpen===i?'rotate(45deg)':'none',display:'inline-block' }}>+</span>
                </button>
                {faqOpen===i&&<div style={{ padding:'0 20px 16px',fontSize:13,color:'rgba(232,232,240,0.55)',lineHeight:1.75 }}>{faq.a}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'60px 24px 80px' }}>
        <FadeIn>
          <div style={{ maxWidth:780,margin:'0 auto',textAlign:'center',padding:'56px 40px',borderRadius:22,border:'1px solid rgba(124,58,237,0.28)',background:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.11) 0%,transparent 70%),rgba(255,255,255,0.015)',backdropFilter:'blur(12px)' }}>
            <div style={{ fontSize:'clamp(26px,4vw,42px)',fontWeight:800,color:'#fff',letterSpacing:-1.5,marginBottom:14 }}>Start Writing Smarter Today</div>
            <p style={{ fontSize:15,color:'rgba(232,232,240,0.45)',marginBottom:34 }}>Free plan available. No credit card. Works on any device.</p>
            <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
              <Link href="/auth/register" style={{ padding:'13px 30px',background:'#7c3aed',color:'#fff',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 0 24px rgba(124,58,237,0.35)' }}>Create free account →</Link>
              <Link href="/auth/login" style={{ padding:'13px 30px',background:'rgba(255,255,255,0.06)',color:'#e8e8f0',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none',border:'1px solid rgba(255,255,255,0.1)' }}>Sign in</Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.07)',padding:'32px 24px',maxWidth:1080,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:14 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:22,height:22,borderRadius:6,background:'linear-gradient(135deg,#7c3aed,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10 }}>✦</div>
          <span style={{ fontSize:13,fontWeight:700,color:'#e8e8f0' }}>Flow-Student</span>
          <span style={{ fontSize:11,color:'rgba(232,232,240,0.3)',marginLeft:6 }}>AI Writing Suite · Zambia 🇿🇲</span>
        </div>
        <div style={{ display:'flex',gap:18,fontSize:12,color:'rgba(232,232,240,0.35)' }}>
          <Link href="/auth/login" style={{ color:'inherit',textDecoration:'none' }}>Login</Link>
          <Link href="/auth/register" style={{ color:'inherit',textDecoration:'none' }}>Sign up</Link>
          <a href="mailto:support@flow-student.com" style={{ color:'inherit',textDecoration:'none' }}>Contact</a>
        </div>
      </footer>

      <style>{`
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        a{-webkit-tap-highlight-color:transparent}

        /* ── Mobile ── */
        @media(max-width:640px){
          .nav-links{display:none!important}
          h1{letter-spacing:-1.5px!important}
          section{padding-left:16px!important;padding-right:16px!important}
          .stat-row{gap:24px!important;flex-wrap:wrap}
          .stat-val{font-size:clamp(28px,8vw,42px)!important}
          .hero-btns{flex-direction:column;align-items:center}
          .hero-btns a,.hero-btns link{width:100%;max-width:300px;text-align:center;justify-content:center}
          .plans-grid{grid-template-columns:1fr!important}
          .tools-grid{grid-template-columns:1fr!important}
          .dashboard-preview .sidebar{display:none!important}
          .cta-box{padding:36px 20px!important}
          .cta-box h2{font-size:26px!important}
        }
        @media(max-width:480px){
          .stat-row{gap:16px}
          .stat-val{font-size:28px!important}
        }
      `}</style>
    </div>
  )
}
