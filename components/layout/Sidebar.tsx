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

// Two intertwined ribbons flowing LEFT→RIGHT, matching the 4th UI exactly
function FlowWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 248, H = 90
    canvas.width  = W
    canvas.height = H
    let frame = 0, raf: number

    // Ribbon A: starts mid → peaks at top-left → crosses mid → troughs at bottom-right → ends mid
    // Ribbon B: starts mid → troughs at bottom-left → crosses mid → peaks at top-right → ends mid
    // They share the same mid-points (crossings) at x=0, x=W/2, x=W

    function ribbonY(x: number, peakY: number, troughY: number, phase: number): number {
      // Full sine cycle across width, phase shifts which ribbon is up/down
      return ((peakY + troughY) / 2) + ((troughY - peakY) / 2) * Math.sin((x / W) * Math.PI * 2 + phase)
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = frame * 0.006
      const mid = H * 0.5

      // Subtle breathing animation — peaks/troughs shift slightly
      const peakA  = H * 0.18 + Math.sin(t * 0.8) * 3
      const troughA = H * 0.82 - Math.sin(t * 0.8) * 3
      const peakB  = H * 0.82 - Math.sin(t * 0.8) * 3
      const troughB = H * 0.18 + Math.sin(t * 0.8) * 3

      // Draw strands for one ribbon
      function drawRibbon(
        peakY: number, troughY: number,
        phase: number, strandCount: number,
        spreadPx: number,
        hue: string, alphaCenter: number
      ) {
        for (let s = 0; s < strandCount; s++) {
          // offset: -spread/2 to +spread/2
          const offset = ((s / (strandCount - 1)) - 0.5) * spreadPx
          const distFromCenter = Math.abs((s / (strandCount - 1)) - 0.5) * 2 // 0=center, 1=edge

          // Center strands brighter and slightly thicker
          const alpha = alphaCenter * (1 - distFromCenter * 0.65) * (0.88 + 0.12 * Math.sin(t + s * 0.4))
          const width = (1 - distFromCenter * 0.7) * 1.1

          // Build path point by point
          ctx.beginPath()
          for (let xi = 0; xi <= W; xi += 2) {
            const y = ribbonY(xi, peakY, troughY, phase) + offset
            if (xi === 0) ctx.moveTo(xi, y)
            else ctx.lineTo(xi, y)
          }

          // Gradient along path from left to right
          const grad = ctx.createLinearGradient(0, 0, W, 0)
          grad.addColorStop(0,    `${hue.replace('A', String(alpha * 0.2))}`)
          grad.addColorStop(0.15, `${hue.replace('A', String(alpha * 0.85))}`)
          grad.addColorStop(0.5,  `${hue.replace('A', String(alpha))}`)
          grad.addColorStop(0.85, `${hue.replace('A', String(alpha * 0.85))}`)
          grad.addColorStop(1,    `${hue.replace('A', String(alpha * 0.2))}`)

          ctx.strokeStyle = grad
          ctx.lineWidth   = width
          ctx.stroke()
        }
      }

      // Ribbon A — bright violet (#B388FF family)
      ctx.save()
      ctx.shadowBlur   = 6
      ctx.shadowColor  = 'rgba(179,136,255,0.5)'
      drawRibbon(peakA, troughA, 0, 16, 16, 'rgba(179,136,255,A)', 0.85)
      ctx.restore()

      // Ribbon B — deeper purple (#7C5CFF family), inverted phase
      ctx.save()
      ctx.shadowBlur   = 6
      ctx.shadowColor  = 'rgba(124,92,255,0.5)'
      drawRibbon(peakB, troughB, 0, 16, 16, 'rgba(124,92,255,A)', 0.75)
      ctx.restore()

      // Thin bright accent strand on Ribbon A (the single brightest centre line)
      ctx.save()
      ctx.shadowBlur  = 10
      ctx.shadowColor = 'rgba(220,200,255,0.8)'
      ctx.beginPath()
      for (let xi = 0; xi <= W; xi += 2) {
        const y = ribbonY(xi, peakA, troughA, 0)
        if (xi === 0) ctx.moveTo(xi, y); else ctx.lineTo(xi, y)
      }
      const accentGrad = ctx.createLinearGradient(0,0,W,0)
      accentGrad.addColorStop(0,   'rgba(220,200,255,0)')
      accentGrad.addColorStop(0.2, 'rgba(220,200,255,0.8)')
      accentGrad.addColorStop(0.5, 'rgba(255,255,255,0.9)')
      accentGrad.addColorStop(0.8, 'rgba(220,200,255,0.8)')
      accentGrad.addColorStop(1,   'rgba(220,200,255,0)')
      ctx.strokeStyle = accentGrad
      ctx.lineWidth   = 0.8
      ctx.stroke()
      ctx.restore()

      // Thin bright accent on Ribbon B
      ctx.save()
      ctx.shadowBlur  = 10
      ctx.shadowColor = 'rgba(179,136,255,0.8)'
      ctx.beginPath()
      for (let xi = 0; xi <= W; xi += 2) {
        const y = ribbonY(xi, peakB, troughB, 0)
        if (xi === 0) ctx.moveTo(xi, y); else ctx.lineTo(xi, y)
      }
      const accent2 = ctx.createLinearGradient(0,0,W,0)
      accent2.addColorStop(0,   'rgba(179,136,255,0)')
      accent2.addColorStop(0.2, 'rgba(179,136,255,0.7)')
      accent2.addColorStop(0.5, 'rgba(220,200,255,0.85)')
      accent2.addColorStop(0.8, 'rgba(179,136,255,0.7)')
      accent2.addColorStop(1,   'rgba(179,136,255,0)')
      ctx.strokeStyle = accent2
      ctx.lineWidth   = 0.8
      ctx.stroke()
      ctx.restore()

      // Crossing glow — SUBTLE, at x=W/2 where ribbons cross mid
      const crossX = W / 2
      const crossGrad = ctx.createRadialGradient(crossX, mid, 0, crossX, mid, 14)
      crossGrad.addColorStop(0,   `rgba(220,200,255,${0.18 + 0.06*Math.sin(t*2)})`)
      crossGrad.addColorStop(0.5, `rgba(179,136,255,${0.08 + 0.03*Math.sin(t*2)})`)
      crossGrad.addColorStop(1,   'rgba(124,92,255,0)')
      ctx.fillStyle = crossGrad
      ctx.fillRect(0,0,W,H)

      // Particles — small, sparse, elegant
      const pts = [
        [28,30],[55,62],[88,20],[108,48],[132,68],[158,28],[185,52],[210,22],[235,60],
        [18,52],[72,38],[148,74],[198,38],[240,44],
      ]
      pts.forEach(([px,py],i) => {
        const drift = Math.sin(t*0.6 + i*0.5) * 2.5
        const a = 0.25 + 0.35 * Math.abs(Math.sin(t*0.4 + i*0.7))
        const r = 0.5 + 0.5 * Math.abs(Math.sin(t*0.8 + i))
        const pg = ctx.createRadialGradient(px, py+drift, 0, px, py+drift, r*4)
        pg.addColorStop(0, `rgba(220,200,255,${a})`)
        pg.addColorStop(1, 'rgba(179,136,255,0)')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(px, py+drift, r*4, 0, Math.PI*2)
        ctx.fill()
      })

      // Atmospheric background glow (very subtle)
      const atm = ctx.createLinearGradient(0,0,0,H)
      atm.addColorStop(0,   'rgba(90,69,255,0)')
      atm.addColorStop(0.5, 'rgba(90,69,255,0.04)')
      atm.addColorStop(1,   'rgba(90,69,255,0)')
      ctx.fillStyle = atm
      ctx.fillRect(0,0,W,H)

      // Edge fades — left, right, top, bottom
      const lf = ctx.createLinearGradient(0,0,20,0)
      lf.addColorStop(0,'#0A0914'); lf.addColorStop(1,'rgba(10,9,20,0)')
      ctx.fillStyle=lf; ctx.fillRect(0,0,20,H)

      const rf = ctx.createLinearGradient(W,0,W-20,0)
      rf.addColorStop(0,'#0A0914'); rf.addColorStop(1,'rgba(10,9,20,0)')
      ctx.fillStyle=rf; ctx.fillRect(W-20,0,20,H)

      const tf = ctx.createLinearGradient(0,0,0,18)
      tf.addColorStop(0,'#0A0914'); tf.addColorStop(1,'rgba(10,9,20,0)')
      ctx.fillStyle=tf; ctx.fillRect(0,0,W,18)

      const bf = ctx.createLinearGradient(0,H,0,H-18)
      bf.addColorStop(0,'#0A0914'); bf.addColorStop(1,'rgba(10,9,20,0)')
      ctx.fillStyle=bf; ctx.fillRect(0,H-18,W,18)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} style={{ width:'100%', height:90, display:'block', flexShrink:0 }}/>
}

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const usagePct = profile
    ? Math.min(100, Math.round((profile.words_used / profile.words_limit) * 100))
    : 0

  useEffect(() => {
    fetch('/api/admin/check').then(r=>r.json()).then(d=>setIsAdmin(d.isAdmin))
  }, [])

  const navItem = (href: string, iconKey: string, label: string, badge?: string, danger?: boolean) => {
    const active = pathname === href
    return (
      <Link key={href} href={href} style={{
        display:'flex', alignItems:'center', gap:13,
        padding:'9px 12px', borderRadius:11, textDecoration:'none',
        background: active ? danger ? 'rgba(220,38,38,0.12)' : 'rgba(92,69,255,0.16)' : 'transparent',
        border: active ? danger ? '1px solid rgba(248,113,113,0.1)' : '1px solid rgba(124,92,255,0.18)' : '1px solid transparent',
        transition:'all 0.15s ease',
      }}>
        <span style={{
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          color: active ? danger ? '#f87171' : '#B388FF' : '#3d3d62',
          filter: active ? danger
            ? 'drop-shadow(0 0 6px rgba(248,113,113,0.65))'
            : 'drop-shadow(0 0 7px rgba(179,136,255,0.9)) drop-shadow(0 0 14px rgba(124,92,255,0.5))'
            : 'none',
          transition:'all 0.15s',
        }}>
          <ToolIcon toolKey={iconKey} size={18}/>
        </span>
        <span style={{
          fontSize:13.5, fontWeight: active ? 600 : 400,
          color: active ? danger ? '#fca5a5' : '#e8e8f0' : '#7878a0',
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

  return (
    <>
      <style>{`
        @keyframes fsGrad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes tagPulse { 0%,100%{opacity:.55} 50%{opacity:.82} }
      `}</style>

      <aside style={{
        width:248, flexShrink:0, display:'flex', flexDirection:'column',
        background:'#0A0914', borderRight:'1px solid rgba(92,69,255,0.1)', overflow:'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:28 }}>

          {/* Ambient radiance */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
            <div style={{
              position:'absolute', width:220, height:180,
              background:'radial-gradient(ellipse at 50% 55%, rgba(124,92,255,0.22) 0%, rgba(90,69,255,0.08) 50%, transparent 72%)',
              borderRadius:'50%', pointerEvents:'none',
            }}/>
            <img src={LOGO_BASE64} alt="Flow-Student" style={{
              width:104, height:104, objectFit:'contain',
              position:'relative', zIndex:1,
              mixBlendMode:'screen',
              filter:'brightness(1.2) contrast(1.05) drop-shadow(0 0 22px rgba(179,136,255,0.9)) drop-shadow(0 0 48px rgba(124,92,255,0.55))',
            }}/>
          </div>

          {/* Brand name — exact landing page gradient, animated */}
          <div style={{
            fontSize:22, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1,
            background:'linear-gradient(135deg, #e8e8f0 0%, #c4b5fd 35%, #a78bfa 65%, #e8e8f0 100%)',
            backgroundSize:'200% 200%',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'fsGrad 4s ease infinite', marginBottom:7,
          }}>
            Flow-Student
          </div>

          {/* Tagline */}
          <div style={{
            fontSize:11, color:'rgba(179,136,255,0.68)', letterSpacing:'0.04em',
            animation:'tagPulse 3.5s ease-in-out infinite',
          }}>
            AI that flows with the mind
          </div>
        </div>

        {/* ── Flowing wave ── */}
        <FlowWave/>

        {/* ── Nav ── */}
        <nav style={{ flex:1, overflowY:'auto', padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:1 }}>
          {TOOLS.map(t => navItem(`/dashboard/${t.key}`, t.key, t.label, t.badge))}
          <div style={{ margin:'8px 4px', borderTop:'1px solid rgba(92,69,255,0.07)' }}/>
          {NAV_EXTRAS.map(i => navItem(i.href, i.iconKey, i.label))}
          {isAdmin && navItem('/dashboard/admin','admin','Admin','ADMIN',true)}
        </nav>

        {/* ── Footer ── */}
        <div style={{ borderTop:'1px solid rgba(92,69,255,0.07)', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:'50%', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg,#5A45FF,#B388FF)',
              fontSize:13, fontWeight:700, color:'#fff',
              boxShadow:'0 0 14px rgba(124,92,255,0.5)',
            }}>
              {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#e8e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:1 }}>
                {profile?.full_name ?? 'User'}
              </div>
              <div style={{ fontSize:11, color:'#4a4a72', textTransform:'capitalize', marginTop:3 }}>
                {profile?.plan ?? 'free'} plan
              </div>
            </div>
          </div>
          <div>
            <div style={{ height:3, background:'rgba(92,69,255,0.1)', borderRadius:999, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:999, width:`${usagePct}%`,
                background: usagePct>90?'#f87171':usagePct>70?'#fb923c':'linear-gradient(90deg,#5A45FF,#B388FF)',
                boxShadow: usagePct>90?'0 0 8px rgba(248,113,113,0.6)':'0 0 10px rgba(124,92,255,0.6)',
                transition:'all 0.4s',
              }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#4a4a72', marginTop:6 }}>
              <span>{profile?.words_used?.toLocaleString()??0} / {(profile?.words_limit??0)>=999_999_999?'∞':profile?.words_limit?.toLocaleString()} words</span>
              {profile?.plan==='free' && (
                <Link href="/dashboard/billing" style={{ color:'#7C5CFF', fontWeight:600, textDecoration:'none', fontSize:11 }}>Upgrade</Link>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
