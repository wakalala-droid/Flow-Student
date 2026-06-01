'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'
import ToolIcon from '@/components/shared/ToolIcon'
import { LOGO_BASE64 } from '@/lib/logo'

const NAV_EXTRAS = [
  { href:'/dashboard/documents', iconKey:'documents', label:'Documents' },
  { href:'/dashboard/billing',   iconKey:'billing',   label:'Billing'   },
  { href:'/dashboard/settings',  iconKey:'settings',  label:'Settings'  },
]

// Strip black background from JPEG at render-time using canvas pixel manipulation
function useTransparentLogo(src: string) {
  const [url, setUrl] = useState<string>('')
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(0, 0, c.width, c.height)
      const px = d.data
      for (let i = 0; i < px.length; i += 4) {
        const brightness = Math.max(px[i], px[i+1], px[i+2])
        if (brightness < 25) {
          px[i+3] = 0
        } else if (brightness < 55) {
          px[i+3] = Math.round(((brightness - 25) / 30) * px[i+3])
        }
      }
      ctx.putImageData(d, 0, 0)
      setUrl(c.toDataURL('image/png'))
    }
    img.src = src
  }, [src])
  return url
}

// ── Flowing intelligence wave — 4th UI reference, exact ──────────────────────
function FlowWave() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 248, H = 88
    canvas.width = W; canvas.height = H
    let frame = 0, raf: number

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = frame * 0.007

      // Three organic ribbon paths — different phase, amplitude, vertical centre
      // None are exact inverses of each other — prevents the infinity symbol
      const ribbons = [
        { cy: H*0.42, amp: H*0.32, phase: 0,            freq: 1.0,  strands: 14, spread: 18, colorR: 179, colorG: 136, colorB: 255, alpha: 0.80 },
        { cy: H*0.55, amp: H*0.24, phase: Math.PI*0.72, freq: 1.1,  strands: 12, spread: 14, colorR: 124, colorG:  92, colorB: 255, alpha: 0.70 },
        { cy: H*0.50, amp: H*0.18, phase: Math.PI*1.45, freq: 0.9,  strands:  8, spread: 10, colorR: 220, colorG: 200, colorB: 255, alpha: 0.55 },
      ]

      ribbons.forEach(({ cy, amp, phase, freq, strands, spread, colorR, colorG, colorB, alpha }) => {
        for (let s = 0; s < strands; s++) {
          const frac = (s / (strands - 1)) - 0.5          // -0.5 → +0.5
          const spreadOffset = frac * spread
          const distEdge = Math.abs(frac) * 2              // 0=centre, 1=edge
          const a   = alpha * (1 - distEdge * 0.68) * (0.85 + 0.15 * Math.sin(t + s * 0.38))
          const lw  = (0.5 + (1 - distEdge) * 0.7) * (s === Math.floor(strands/2) ? 1.15 : 1)

          // Horizontal gradient — fades at edges
          const g = ctx.createLinearGradient(0, 0, W, 0)
          g.addColorStop(0,    `rgba(${colorR},${colorG},${colorB},0)`)
          g.addColorStop(0.08, `rgba(${colorR},${colorG},${colorB},${a * 0.6})`)
          g.addColorStop(0.35, `rgba(${colorR},${colorG},${colorB},${a})`)
          g.addColorStop(0.65, `rgba(${colorR},${colorG},${colorB},${a})`)
          g.addColorStop(0.92, `rgba(${colorR},${colorG},${colorB},${a * 0.6})`)
          g.addColorStop(1,    `rgba(${colorR},${colorG},${colorB},0)`)

          ctx.beginPath()
          for (let xi = 0; xi <= W; xi += 1.5) {
            // Organic sine — add subtle second harmonic for natural look
            const primary   =  amp * Math.sin(xi / W * Math.PI * 2 * freq + phase + t * 0.8)
            const secondary = (amp * 0.15) * Math.sin(xi / W * Math.PI * 4 * freq + phase * 1.3 + t * 1.2)
            const y = cy + primary + secondary + spreadOffset
            xi < 1 ? ctx.moveTo(xi, y) : ctx.lineTo(xi, y)
          }

          ctx.save()
          if (s === Math.floor(strands / 2)) {
            ctx.shadowBlur = 8; ctx.shadowColor = `rgba(${colorR},${colorG},${colorB},0.6)`
          }
          ctx.strokeStyle = g
          ctx.lineWidth   = lw
          ctx.stroke()
          ctx.restore()
        }
      })

      // Particles — fine glowing dots drifting slightly
      const particles = [
        [18,34],[42,58],[70,26],[96,50],[118,70],[140,32],[165,54],[190,28],[215,48],[238,36],
        [30,65],[80,44],[130,20],[175,62],[228,52],
      ]
      particles.forEach(([px, py], i) => {
        const drift = Math.sin(t * 0.5 + i * 0.55) * 3
        const a = 0.2 + 0.4 * Math.abs(Math.sin(t * 0.4 + i * 0.65))
        const r = 0.6 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))
        const pg = ctx.createRadialGradient(px, py + drift, 0, px, py + drift, r * 5)
        pg.addColorStop(0, `rgba(220,200,255,${a})`)
        pg.addColorStop(1, 'rgba(179,136,255,0)')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(px, py + drift, r * 5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Atmospheric glow — very soft, wide
      const atm = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6)
      atm.addColorStop(0, `rgba(90,69,255,${0.04 + 0.02 * Math.sin(t)})`)
      atm.addColorStop(1, 'rgba(90,69,255,0)')
      ctx.fillStyle = atm; ctx.fillRect(0, 0, W, H)

      // Edge fades — left, right, top, bottom
      ;([
        ['linear', 0, 0, 22, 0, 0, 0, 22, H, 0, 22],
        ['linear', W, 0, W-22, 0, W-22, 0, 22, H, W-22, 0],
        ['linear', 0, 0, 0, 20, 0, 0, W, 20, 0, 0],
        ['linear', 0, H, 0, H-20, 0, H-20, W, 20, 0, H-20],
      ] as const).forEach(([,x1,y1,x2,y2,rx,ry,rw,rh]: readonly (string|number)[]) => {
        const f = ctx.createLinearGradient(x1 as number, y1 as number, x2 as number, y2 as number)
        f.addColorStop(0, '#0A0914')
        f.addColorStop(1, 'rgba(10,9,20,0)')
        ctx.fillStyle = f
        ctx.fillRect(rx as number, ry as number, rw as number, rh as number)
      })

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas ref={ref}
      style={{ width:'100%', height:88, display:'block', flexShrink:0 }}
    />
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ href, iconKey, label, badge, danger, active }: {
  href:string; iconKey:string; label:string; badge?:string; danger?:boolean; active:boolean
}) {
  return (
    <Link href={href} style={{
      display:'flex', alignItems:'center', gap:13,
      padding:'9px 12px', borderRadius:11, textDecoration:'none',
      background: active ? danger ? 'rgba(220,38,38,0.12)' : 'rgba(92,69,255,0.17)' : 'transparent',
      border: active
        ? danger ? '1px solid rgba(248,113,113,0.12)' : '1px solid rgba(124,92,255,0.20)'
        : '1px solid transparent',
      transition:'all 0.14s ease',
    }}>
      <span style={{
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        color: active ? danger ? '#f87171' : '#B388FF' : '#3a3a5e',
        filter: active
          ? danger
            ? 'drop-shadow(0 0 6px rgba(248,113,113,0.7))'
            : 'drop-shadow(0 0 7px rgba(179,136,255,1)) drop-shadow(0 0 16px rgba(124,92,255,0.55))'
          : 'none',
        transition:'all 0.14s',
      }}>
        <ToolIcon toolKey={iconKey} size={18}/>
      </span>
      <span style={{
        fontSize:13.5, fontWeight: active ? 600 : 400,
        color: active ? danger ? '#fca5a5' : '#e8e8f0' : '#74748e',
        flex:1, letterSpacing:'-0.1px', lineHeight:1,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
      }}>
        {label}
      </span>
      {badge && (
        <span style={{
          fontSize:9, fontWeight:700, letterSpacing:'0.06em',
          padding:'2px 6px', borderRadius:999, flexShrink:0,
          background: badge==='HOT'?'rgba(251,146,60,0.15)':badge==='ADMIN'?'rgba(220,38,38,0.15)':'rgba(52,211,153,0.1)',
          color: badge==='HOT'?'#fb923c':badge==='ADMIN'?'#f87171':'#34d399',
          border:`1px solid ${badge==='HOT'?'rgba(251,146,60,0.25)':badge==='ADMIN'?'rgba(248,113,113,0.2)':'rgba(52,211,153,0.18)'}`,
        }}>{badge}</span>
      )}
    </Link>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname  = usePathname()
  const logoUrl   = useTransparentLogo(LOGO_BASE64)
  const [isAdmin, setIsAdmin] = useState(false)
  const usagePct  = profile
    ? Math.min(100, Math.round((profile.words_used / profile.words_limit) * 100))
    : 0

  useEffect(() => {
    fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.isAdmin))
  }, [])

  return (
    <>
      <style>{`
        @keyframes fsGrad {
          0%   { background-position: 0%   50% }
          50%  { background-position: 100% 50% }
          100% { background-position: 0%   50% }
        }
        @keyframes tagPulse { 0%,100%{opacity:.58} 50%{opacity:.88} }
      `}</style>

      <aside style={{
        width:248, flexShrink:0, display:'flex', flexDirection:'column',
        background:'#0A0914',
        borderRight:'1px solid rgba(92,69,255,0.09)',
        overflow:'hidden',
      }}>

        {/* ── Logo + brand ─────────────────────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:28, paddingBottom:0 }}>

          {/* Ambient radiance behind logo */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
            <div style={{
              position:'absolute', width:210, height:170,
              background:'radial-gradient(ellipse at 50% 52%, rgba(124,92,255,0.24) 0%, rgba(90,69,255,0.09) 48%, transparent 70%)',
              borderRadius:'50%', pointerEvents:'none',
            }}/>
            {/* Canvas-stripped logo — black bg removed at render time */}
            {logoUrl ? (
              <img src={logoUrl} alt="Flow-Student" style={{
                width:108, height:108, objectFit:'contain',
                position:'relative', zIndex:1,
                filter:'drop-shadow(0 0 20px rgba(179,136,255,0.85)) drop-shadow(0 0 44px rgba(124,92,255,0.50))',
              }}/>
            ) : (
              // Fallback while canvas processing
              <img src={LOGO_BASE64} alt="Flow-Student" style={{
                width:108, height:108, objectFit:'contain',
                position:'relative', zIndex:1,
                mixBlendMode:'screen',
                filter:'brightness(1.2) contrast(1.05) drop-shadow(0 0 20px rgba(179,136,255,0.85))',
              }}/>
            )}
          </div>

          {/* Flow-Student — landing page gradient, animated */}
          <div style={{
            fontSize:22, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1,
            background:'linear-gradient(135deg,#e8e8f0 0%,#c4b5fd 35%,#a78bfa 65%,#e8e8f0 100%)',
            backgroundSize:'220% 220%',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'fsGrad 4s ease infinite',
            marginBottom:7,
          }}>
            Flow-Student
          </div>

          {/* Tagline */}
          <div style={{
            fontSize:11, color:'rgba(179,136,255,0.68)',
            letterSpacing:'0.04em', lineHeight:1,
            animation:'tagPulse 3.5s ease-in-out infinite',
          }}>
            AI that flows with the mind
          </div>
        </div>

        {/* ── Intelligence wave ────────────────────────────────────────── */}
        <FlowWave/>

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <nav style={{ flex:1, overflowY:'auto', padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:1 }}>
          {TOOLS.map(t => (
            <NavItem key={t.key}
              href={`/dashboard/${t.key}`} iconKey={t.key}
              label={t.label} badge={t.badge}
              active={pathname === `/dashboard/${t.key}`}
            />
          ))}
          <div style={{ margin:'8px 4px', borderTop:'1px solid rgba(92,69,255,0.07)' }}/>
          {NAV_EXTRAS.map(i => (
            <NavItem key={i.href}
              href={i.href} iconKey={i.iconKey} label={i.label}
              active={pathname === i.href}
            />
          ))}
          {isAdmin && (
            <NavItem
              href="/dashboard/admin" iconKey="admin" label="Admin"
              badge="ADMIN" danger active={pathname === '/dashboard/admin'}
            />
          )}
        </nav>

        {/* ── Usage footer ─────────────────────────────────────────────── */}
        <div style={{
          borderTop:'1px solid rgba(92,69,255,0.07)',
          padding:'12px 14px', display:'flex', flexDirection:'column', gap:10,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:'50%', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg,#5A45FF,#B388FF)',
              fontSize:13, fontWeight:700, color:'#fff',
              boxShadow:'0 0 14px rgba(124,92,255,0.50)',
            }}>
              {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#e8e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:1 }}>
                {profile?.full_name ?? 'User'}
              </div>
              <div style={{ fontSize:11, color:'#44446a', textTransform:'capitalize', marginTop:3 }}>
                {profile?.plan ?? 'free'} plan
              </div>
            </div>
          </div>
          <div>
            <div style={{ height:3, background:'rgba(92,69,255,0.10)', borderRadius:999, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:999, width:`${usagePct}%`,
                background: usagePct>90?'#f87171':usagePct>70?'#fb923c':'linear-gradient(90deg,#5A45FF,#B388FF)',
                boxShadow: usagePct>90?'0 0 8px rgba(248,113,113,0.6)':'0 0 10px rgba(124,92,255,0.55)',
                transition:'all 0.4s',
              }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#44446a', marginTop:6 }}>
              <span>
                {profile?.words_used?.toLocaleString()??0} / {(profile?.words_limit??0)>=999_999_999?'∞':profile?.words_limit?.toLocaleString()} words
              </span>
              {profile?.plan==='free' && (
                <Link href="/dashboard/billing" style={{ color:'#7C5CFF', fontWeight:600, textDecoration:'none', fontSize:11 }}>
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
