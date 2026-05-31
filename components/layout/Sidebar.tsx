'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'
import ToolIcon from '@/components/shared/ToolIcon'
import { LOGO_BASE64 } from '@/lib/logo'

const NAV_EXTRAS = [
  { href:'/dashboard/documents', iconKey:'documents', label:'Documents' },
  { href:'/dashboard/billing',   iconKey:'billing',   label:'Billing'   },
  { href:'/dashboard/settings',  iconKey:'settings',  label:'Settings'  },
]

// ─── Intelligence Wave ────────────────────────────────────────────────────────
// Flowing light ribbons — cinematic, Apple/Behance quality
function IntelligenceWave() {
  return (
    <div style={{ width:'100%', height:110, position:'relative', overflow:'hidden', flexShrink:0, marginTop:-4 }}>
      <svg viewBox="0 0 260 110" preserveAspectRatio="xMidYMid slice"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          {/* ── Filters ── */}
          {/* Ultra-soft atmospheric bloom */}
          <filter id="f-atm" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="14" result="b"/>
            <feMerge><feMergeNode in="b"/></feMerge>
          </filter>
          {/* Background strand — very soft */}
          <filter id="f-bg" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Mid strand */}
          <filter id="f-mid" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Foreground — sharp with tight glow */}
          <filter id="f-fg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b1"/>
            <feGaussianBlur stdDeviation="3" result="b2"/>
            <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Intersection bloom */}
          <filter id="f-int" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b1"/>
            <feGaussianBlur stdDeviation="8" result="b2"/>
            <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Particle glow */}
          <filter id="f-pt" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5"/>
          </filter>

          {/* ── Color gradients (color palette: #7C5CFF #B388FF #DCC9FF #3526A8 #5A45FF) ── */}
          <linearGradient id="g-r1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3526A8" stopOpacity="0"/>
            <stop offset="20%"  stopColor="#5A45FF" stopOpacity="0.8"/>
            <stop offset="55%"  stopColor="#B388FF" stopOpacity="1"/>
            <stop offset="80%"  stopColor="#7C5CFF" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#3526A8" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="g-r2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3526A8" stopOpacity="0"/>
            <stop offset="25%"  stopColor="#7C5CFF" stopOpacity="0.7"/>
            <stop offset="60%"  stopColor="#DCC9FF" stopOpacity="0.95"/>
            <stop offset="85%"  stopColor="#B388FF" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#3526A8" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="g-r3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#5A45FF" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#7C5CFF" stopOpacity="0.5"/>
            <stop offset="65%"  stopColor="#B388FF" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#5A45FF" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="g-bg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3526A8" stopOpacity="0"/>
            <stop offset="45%"  stopColor="#5A45FF" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#3526A8" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="g-bg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3526A8" stopOpacity="0"/>
            <stop offset="50%"  stopColor="#7C5CFF" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3526A8" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="g-thin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#DCC9FF" stopOpacity="0"/>
            <stop offset="35%"  stopColor="#DCC9FF" stopOpacity="0.55"/>
            <stop offset="70%"  stopColor="#B388FF" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#DCC9FF" stopOpacity="0"/>
          </linearGradient>

          {/* Horizontal edge fade */}
          <linearGradient id="g-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0A0914" stopOpacity="1"/>
            <stop offset="10%"  stopColor="#0A0914" stopOpacity="0"/>
            <stop offset="90%"  stopColor="#0A0914" stopOpacity="0"/>
            <stop offset="100%" stopColor="#0A0914" stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="g-vfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0A0914" stopOpacity="1"/>
            <stop offset="18%"  stopColor="#0A0914" stopOpacity="0"/>
            <stop offset="82%"  stopColor="#0A0914" stopOpacity="0"/>
            <stop offset="100%" stopColor="#0A0914" stopOpacity="1"/>
          </linearGradient>
        </defs>

        {/* ── Atmospheric base glow ── */}
        <ellipse cx="130" cy="60" rx="120" ry="38"
          fill="#5A45FF" opacity="0.07" filter="url(#f-atm)"/>
        <ellipse cx="95"  cy="55" rx="70"  ry="25"
          fill="#7C5CFF" opacity="0.09" filter="url(#f-atm)"/>
        <ellipse cx="175" cy="62" rx="60"  ry="22"
          fill="#B388FF" opacity="0.07" filter="url(#f-atm)"/>

        {/* ── LAYER 1: Deep background trails (very blurred, barely visible) ── */}
        <path d="M-10,78 C 18,58 42,88 72,66 S 118,42 155,72 S 205,90 270,62"
          fill="none" stroke="url(#g-bg1)" strokeWidth="1" filter="url(#f-bg)" opacity="0.45"/>
        <path d="M-10,38 C 22,55 48,28 80,48 S 135,68 170,44 S 222,28 270,50"
          fill="none" stroke="url(#g-bg2)" strokeWidth="0.8" filter="url(#f-bg)" opacity="0.4"/>
        <path d="M-10,62 C 28,80 55,50 88,72 S 140,82 178,58 S 228,42 270,68"
          fill="none" stroke="url(#g-bg1)" strokeWidth="1.2" filter="url(#f-bg)" opacity="0.5"/>

        {/* ── LAYER 2: Mid-ground strands (soft bloom, translucent) ── */}
        <path d="M-10,68 C 22,48 48,76 82,54 S 135,36 168,62 S 218,80 270,52"
          fill="none" stroke="url(#g-r3)" strokeWidth="1.8" filter="url(#f-mid)" opacity="0.65"/>
        <path d="M-10,48 C 30,62 58,34 94,58 S 148,74 185,50 S 232,34 270,58"
          fill="none" stroke="url(#g-r3)" strokeWidth="1.4" filter="url(#f-mid)" opacity="0.6"/>

        {/* ── LAYER 3: Crossing ribbon (creates depth intersection) ── */}
        <path d="M-10,42 C 35,65 65,40 105,68 S 162,82 200,55 S 242,36 270,64"
          fill="none" stroke="url(#g-r2)" strokeWidth="2" filter="url(#f-mid)" opacity="0.7"/>

        {/* ── LAYER 4: Foreground bright ribbons (sharp, luminous) ── */}
        {/* Main ribbon — thickest, brightest */}
        <path d="M-10,72 C 18,50 45,82 78,56 S 128,34 162,60 S 212,78 270,48"
          fill="none" stroke="url(#g-r1)" strokeWidth="2.8" filter="url(#f-fg)" opacity="0.95"/>
        {/* Second foreground ribbon — slightly offset */}
        <path d="M-10,56 C 28,38 55,70 90,48 S 145,28 182,56 S 228,68 270,42"
          fill="none" stroke="url(#g-r2)" strokeWidth="2.2" filter="url(#f-fg)" opacity="0.9"/>

        {/* ── LAYER 5: Ultra-thin accent filaments ── */}
        <path d="M-10,64 C 40,46 70,74 108,52 S 160,36 198,58 S 238,70 270,50"
          fill="none" stroke="url(#g-thin)" strokeWidth="0.6" filter="url(#f-fg)" opacity="0.7"/>
        <path d="M-10,50 C 32,68 62,38 98,62 S 152,80 190,52 S 234,36 270,60"
          fill="none" stroke="url(#g-thin)" strokeWidth="0.5" filter="url(#f-fg)" opacity="0.6"/>

        {/* ── LAYER 6: Intersection glow points (intelligence gathering) ── */}
        <ellipse cx="80"  cy="57" rx="4"  ry="3"  fill="#DCC9FF" opacity="0.6" filter="url(#f-int)"/>
        <ellipse cx="132" cy="46" rx="5"  ry="3.5" fill="#B388FF" opacity="0.7" filter="url(#f-int)"/>
        <ellipse cx="168" cy="60" rx="4"  ry="3"  fill="#DCC9FF" opacity="0.55" filter="url(#f-int)"/>
        <ellipse cx="55"  cy="68" rx="3"  ry="2"  fill="#7C5CFF" opacity="0.5" filter="url(#f-int)"/>
        <ellipse cx="210" cy="52" rx="4"  ry="2.5" fill="#B388FF" opacity="0.6" filter="url(#f-int)"/>

        {/* ── LAYER 7: Particles (intelligent dust, drifting up) ── */}
        {[
          [24,72,0.9,0.8],[48,58,0.7,0.65],[68,52,1.1,0.9],[95,42,0.8,0.7],
          [118,68,0.9,0.85],[138,38,0.7,0.75],[158,56,1.0,0.9],[182,44,0.8,0.7],
          [202,64,0.9,0.8],[222,50,0.7,0.65],[242,58,0.8,0.75],[105,76,0.6,0.6],
        ].map(([cx,cy,r,op],i)=>(
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="#DCC9FF" opacity={op} filter="url(#f-pt)"/>
        ))}

        {/* ── Edge fades (horizontal + vertical) ── */}
        <rect x="0" y="0" width="260" height="110" fill="url(#g-fade)"/>
        <rect x="0" y="0" width="260" height="110" fill="url(#g-vfade)"/>
      </svg>
    </div>
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
          transition:'color 0.15s',
        }}>
          {label}
        </span>
        {badge && (
          <span style={{
            fontSize:9, fontWeight:700, letterSpacing:'0.06em',
            padding:'2px 6px', borderRadius:999, flexShrink:0,
            background: badge==='HOT' ? 'rgba(251,146,60,0.15)' : badge==='ADMIN' ? 'rgba(220,38,38,0.15)' : 'rgba(52,211,153,0.1)',
            color:       badge==='HOT' ? '#fb923c' : badge==='ADMIN' ? '#f87171' : '#34d399',
            border:`1px solid ${badge==='HOT' ? 'rgba(251,146,60,0.25)' : badge==='ADMIN' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.18)'}`,
          }}>{badge}</span>
        )}
      </Link>
    )
  }

  return (
    <aside style={{
      width:248, flexShrink:0, display:'flex', flexDirection:'column',
      background:'#0A0914',
      borderRight:'1px solid rgba(92,69,255,0.1)',
      overflow:'hidden',
    }}>

      {/* ── Logo header ─────────────────────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:30, paddingBottom:0 }}>

        {/* Ambient background radiance */}
        <div style={{
          position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
          marginBottom:12,
        }}>
          <div style={{
            position:'absolute', width:180, height:180,
            background:'radial-gradient(ellipse at center, rgba(124,92,255,0.22) 0%, rgba(90,69,255,0.1) 40%, transparent 70%)',
            borderRadius:'50%',
          }}/>
          {/* Logo — mix-blend-mode:screen removes black background */}
          <img
            src={LOGO_BASE64}
            alt="Flow-Student"
            style={{
              width:100, height:100,
              objectFit:'contain',
              position:'relative', zIndex:1,
              mixBlendMode:'screen',
              filter:'drop-shadow(0 0 18px rgba(179,136,255,0.8)) drop-shadow(0 0 40px rgba(124,92,255,0.5))',
            }}
          />
        </div>

        {/* Brand name */}
        <div style={{ fontSize:21, fontWeight:700, color:'#ffffff', letterSpacing:'-0.5px', lineHeight:1, marginBottom:6 }}>
          Flow-Student
        </div>
        {/* Tagline */}
        <div style={{ fontSize:11.5, fontWeight:400, color:'rgba(179,136,255,0.6)', letterSpacing:'0.05em' }}>
          Humanized Writing AI
        </div>
      </div>

      {/* ── Intelligence Wave ──────────────────────────────────────────── */}
      <IntelligenceWave/>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav style={{ flex:1, overflowY:'auto', padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:1 }}>
        {TOOLS.map(t => navItem(`/dashboard/${t.key}`, t.key, t.label, t.badge))}
        <div style={{ margin:'8px 4px', borderTop:'1px solid rgba(92,69,255,0.08)' }}/>
        {NAV_EXTRAS.map(i => navItem(i.href, i.iconKey, i.label))}
        {isAdmin && navItem('/dashboard/admin','admin','Admin','ADMIN',true)}
      </nav>

      {/* ── Usage footer ─────────────────────────────────────────────── */}
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
              background: usagePct>90 ? '#f87171' : usagePct>70 ? '#fb923c' : 'linear-gradient(90deg,#5A45FF,#B388FF)',
              boxShadow: usagePct>90 ? '0 0 8px rgba(248,113,113,0.6)' : '0 0 10px rgba(124,92,255,0.6)',
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
  )
}
