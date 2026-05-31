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

// ─── Intelligence Wave — cinematic crossing ribbons ───────────────────────────
function IntelligenceWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = 248
    const H = canvas.height = 110
    let frame = 0
    let raf: number

    function draw() {
      ctx.clearRect(0, 0, W, H)

      const t = frame * 0.008

      // ── Upper ribbon bundle: enters top-left, curves down to cross at center ──
      // ── Lower ribbon bundle: enters bottom-left, curves up to cross at center ─
      // Cross point ~(W*0.44, H*0.5)
      const cx = W * 0.44
      const cy = H * 0.50

      // Generate fine parallel strands for each side of the crossing
      // Each strand is a cubic bezier

      function drawBundle(
        strands: number,
        // Left side control points (before cross)
        x0: number, y0base: number, y0spread: number,
        cp1x: number, cp1ybase: number, cp1yspread: number,
        cp2x: number, cp2ybase: number, cp2yspread: number,
        // End at crossing
        colorA: string, colorB: string,
        widthBase: number, alphaBase: number,
        phase: number
      ) {
        for (let i = 0; i < strands; i++) {
          const frac = (i / (strands - 1)) - 0.5 // -0.5 to 0.5
          const y0   = y0base   + frac * y0spread
          const cp1y = cp1ybase + frac * cp1yspread * 0.7
          const cp2y = cp2ybase + frac * cp2yspread * 0.4
          const alpha = alphaBase * (1 - 0.5 * Math.abs(frac)) * (0.85 + 0.15 * Math.sin(t + i * 0.3 + phase))
          const w = widthBase * (1 - 0.6 * Math.abs(frac))

          const grad = ctx.createLinearGradient(x0, y0, cx, cy)
          grad.addColorStop(0, colorA.replace('A', String(alpha * 0.3)))
          grad.addColorStop(0.6, colorB.replace('A', String(alpha * 0.8)))
          grad.addColorStop(1, `rgba(220,200,255,${alpha})`)

          ctx.beginPath()
          ctx.moveTo(x0, y0)
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cx, cy)
          ctx.strokeStyle = grad
          ctx.lineWidth = w
          ctx.stroke()
        }
      }

      function drawBundleRight(
        strands: number,
        cp1x: number, cp1ybase: number, cp1yspread: number,
        cp2x: number, cp2ybase: number, cp2yspread: number,
        x1: number, y1base: number, y1spread: number,
        colorA: string, colorB: string,
        widthBase: number, alphaBase: number,
        phase: number
      ) {
        for (let i = 0; i < strands; i++) {
          const frac = (i / (strands - 1)) - 0.5
          const y1   = y1base + frac * y1spread
          const cp1y = cp1ybase + frac * cp1yspread * 0.4
          const cp2y = cp2ybase + frac * cp2yspread * 0.7
          const alpha = alphaBase * (1 - 0.5 * Math.abs(frac)) * (0.85 + 0.15 * Math.sin(t + i * 0.3 + phase))
          const w = widthBase * (1 - 0.6 * Math.abs(frac))

          const grad = ctx.createLinearGradient(cx, cy, x1, y1)
          grad.addColorStop(0, `rgba(220,200,255,${alpha})`)
          grad.addColorStop(0.4, colorA.replace('A', String(alpha * 0.8)))
          grad.addColorStop(1, colorB.replace('A', String(alpha * 0.25)))

          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1)
          ctx.strokeStyle = grad
          ctx.lineWidth = w
          ctx.stroke()
        }
      }

      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      // === PRE-CROSS: Upper-left bundle (enters from top-left, comes DOWN to cx,cy) ===
      drawBundle(18,
        -8, 18, 28,          // start: x0, y0=18 ±14
        W*0.18, 25, 22,      // cp1
        W*0.34, 38, 14,      // cp2
        'rgba(90,69,255,A)', 'rgba(124,92,255,A)',
        1.0, 0.85, 0
      )

      // === PRE-CROSS: Lower-left bundle (enters from bottom-left, comes UP to cx,cy) ===
      drawBundle(18,
        -8, 88, 28,
        W*0.18, 82, 22,
        W*0.34, 66, 14,
        'rgba(53,38,168,A)', 'rgba(90,69,255,A)',
        0.9, 0.8, 1.2
      )

      // === POST-CROSS: Upper-right bundle (leaves cx,cy going DOWN to bottom-right) ===
      drawBundleRight(18,
        W*0.55, 58, 14,
        W*0.74, 72, 22,
        W+8, 80, 30,
        'rgba(124,92,255,A)', 'rgba(90,69,255,A)',
        0.9, 0.8, 2.1
      )

      // === POST-CROSS: Lower-right bundle (leaves cx,cy going UP to top-right) ===
      drawBundleRight(18,
        W*0.55, 42, 14,
        W*0.74, 32, 22,
        W+8, 22, 28,
        'rgba(179,136,255,A)', 'rgba(124,92,255,A)',
        1.0, 0.85, 0.9
      )

      ctx.restore()

      // === ATMOSPHERE: volumetric glow blobs ===
      const atmGrad1 = ctx.createRadialGradient(cx*0.45, H*0.4, 0, cx*0.45, H*0.4, 55)
      atmGrad1.addColorStop(0, `rgba(90,69,255,${0.10 + 0.03*Math.sin(t)})`)
      atmGrad1.addColorStop(1, 'rgba(90,69,255,0)')
      ctx.fillStyle = atmGrad1
      ctx.fillRect(0,0,W,H)

      const atmGrad2 = ctx.createRadialGradient(W*0.72, H*0.55, 0, W*0.72, H*0.55, 48)
      atmGrad2.addColorStop(0, `rgba(124,92,255,${0.09 + 0.03*Math.sin(t*1.3)})`)
      atmGrad2.addColorStop(1, 'rgba(124,92,255,0)')
      ctx.fillStyle = atmGrad2
      ctx.fillRect(0,0,W,H)

      // === CROSSING POINT: super-bright white bloom ===
      const pulse = 0.85 + 0.15 * Math.sin(t * 2.5)
      const crossGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18)
      crossGrad.addColorStop(0, `rgba(255,255,255,${0.92 * pulse})`)
      crossGrad.addColorStop(0.3, `rgba(220,200,255,${0.6 * pulse})`)
      crossGrad.addColorStop(0.6, `rgba(179,136,255,${0.3 * pulse})`)
      crossGrad.addColorStop(1, 'rgba(124,92,255,0)')
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = crossGrad
      ctx.beginPath()
      ctx.arc(cx, cy, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'

      // === PARTICLES: intelligent dust ===
      const particles = [
        [14,32],[38,22],[62,42],[88,18],[115,30],[138,64],[162,28],
        [185,48],[208,22],[228,38],[242,56],[30,70],[72,80],[98,58],
        [155,72],[190,66],[220,50],[18,55],[52,60],[175,34],
      ]
      particles.forEach(([px,py],i) => {
        const drift = Math.sin(t * 0.7 + i * 0.4) * 2
        const alpha = 0.3 + 0.4 * Math.abs(Math.sin(t * 0.5 + i * 0.6))
        const r = 0.6 + 0.6 * Math.abs(Math.sin(t + i * 0.9))
        const pg = ctx.createRadialGradient(px, py + drift, 0, px, py + drift, r * 3)
        pg.addColorStop(0, `rgba(220,200,255,${alpha})`)
        pg.addColorStop(1, 'rgba(179,136,255,0)')
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(px, py + drift, r * 3, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      // === EDGE FADES ===
      // Left fade
      const lf = ctx.createLinearGradient(0,0,28,0)
      lf.addColorStop(0, '#0A0914'); lf.addColorStop(1, 'rgba(10,9,20,0)')
      ctx.fillStyle = lf; ctx.fillRect(0,0,28,H)
      // Right fade
      const rf = ctx.createLinearGradient(W,0,W-28,0)
      rf.addColorStop(0, '#0A0914'); rf.addColorStop(1, 'rgba(10,9,20,0)')
      ctx.fillStyle = rf; ctx.fillRect(W-28,0,28,H)
      // Top fade
      const tf = ctx.createLinearGradient(0,0,0,22)
      tf.addColorStop(0, '#0A0914'); tf.addColorStop(1, 'rgba(10,9,20,0)')
      ctx.fillStyle = tf; ctx.fillRect(0,0,W,22)
      // Bottom fade
      const bf = ctx.createLinearGradient(0,H,0,H-22)
      bf.addColorStop(0, '#0A0914'); bf.addColorStop(1, 'rgba(10,9,20,0)')
      ctx.fillStyle = bf; ctx.fillRect(0,H-22,W,22)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas ref={canvasRef}
      style={{ width:'100%', height:110, display:'block', flexShrink:0 }}/>
  )
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
        display:'flex', alignItems:'center', gap:14,
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
            : 'drop-shadow(0 0 8px rgba(179,136,255,0.9)) drop-shadow(0 0 16px rgba(124,92,255,0.5))'
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
            color:       badge==='HOT'?'#fb923c':badge==='ADMIN'?'#f87171':'#34d399',
            border:`1px solid ${badge==='HOT'?'rgba(251,146,60,0.25)':badge==='ADMIN'?'rgba(248,113,113,0.2)':'rgba(52,211,153,0.18)'}`,
          }}>{badge}</span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Gradient text animation */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50% }
          50%  { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes taglineShimmer {
          0%   { opacity: 0.55 }
          50%  { opacity: 0.85 }
          100% { opacity: 0.55 }
        }
      `}</style>

      <aside style={{
        width:248, flexShrink:0, display:'flex', flexDirection:'column',
        background:'#0A0914',
        borderRight:'1px solid rgba(92,69,255,0.1)',
        overflow:'hidden',
      }}>

        {/* ── Logo + branding ───────────────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:28 }}>

          {/* Ambient glow behind logo */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
            <div style={{
              position:'absolute', width:200, height:160,
              background:'radial-gradient(ellipse at center, rgba(124,92,255,0.20) 0%, rgba(90,69,255,0.08) 45%, transparent 70%)',
              borderRadius:'50%',
            }}/>
            {/* Logo — mix-blend-mode:screen erases the black JPEG background */}
            <img src={LOGO_BASE64} alt="Flow-Student"
              style={{
                width:100, height:100, objectFit:'contain',
                position:'relative', zIndex:1,
                mixBlendMode:'screen',
                filter:'brightness(1.15) contrast(1.1) drop-shadow(0 0 20px rgba(179,136,255,0.85)) drop-shadow(0 0 45px rgba(124,92,255,0.5))',
              }}
            />
          </div>

          {/* "Flow-Student" — exact gradient from landing page nav, animated */}
          <div style={{
            fontSize:22, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1,
            background:'linear-gradient(135deg, #e8e8f0 0%, #c4b5fd 30%, #a78bfa 60%, #e8e8f0 100%)',
            backgroundSize:'200% 200%',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            animation:'gradientShift 4s ease infinite',
            marginBottom:7,
          }}>
            Flow-Student
          </div>

          {/* Tagline */}
          <div style={{
            fontSize:11, fontWeight:400,
            color:'rgba(179,136,255,0.7)',
            letterSpacing:'0.03em',
            animation:'taglineShimmer 3s ease-in-out infinite',
          }}>
            AI that flows with the mind
          </div>
        </div>

        {/* ── Intelligence Wave (animated canvas) ───────────────────── */}
        <IntelligenceWave/>

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <nav style={{ flex:1, overflowY:'auto', padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:1 }}>
          {TOOLS.map(t => navItem(`/dashboard/${t.key}`, t.key, t.label, t.badge))}
          <div style={{ margin:'8px 4px', borderTop:'1px solid rgba(92,69,255,0.08)' }}/>
          {NAV_EXTRAS.map(i => navItem(i.href, i.iconKey, i.label))}
          {isAdmin && navItem('/dashboard/admin','admin','Admin','ADMIN',true)}
        </nav>

        {/* ── Usage footer ───────────────────────────────────────────── */}
        <div style={{ borderTop:'1px solid rgba(92,69,255,0.08)', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
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
            <div style={{ height:3, background:'rgba(92,69,255,0.12)', borderRadius:999, overflow:'hidden' }}>
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
