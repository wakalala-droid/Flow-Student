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

// ── Luminescent wave — pixel-matched to rightmost reference UI ───────────────
function LuminescentWave() {
  return (
    <div style={{ width:'100%', height:96, position:'relative', overflow:'hidden', flexShrink:0 }}>
      <svg viewBox="0 0 260 96" preserveAspectRatio="xMidYMid slice"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          {/* Core glow — tight */}
          <filter id="gcore" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Bloom — wide soft halo */}
          <filter id="gbloom" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b1"/>
            <feGaussianBlur stdDeviation="10" result="b2"/>
            <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Fade edges horizontally */}
          <linearGradient id="fadeH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0d0d1a" stopOpacity="1"/>
            <stop offset="12%"  stopColor="#0d0d1a" stopOpacity="0"/>
            <stop offset="88%"  stopColor="#0d0d1a" stopOpacity="0"/>
            <stop offset="100%" stopColor="#0d0d1a" stopOpacity="1"/>
          </linearGradient>
          {/* Wave colours */}
          <linearGradient id="wc1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#6d28d9" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#8b5cf6" stopOpacity="1"/>
            <stop offset="65%"  stopColor="#c084fc" stopOpacity="1"/>
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="wc2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#5b21b6" stopOpacity="0"/>
            <stop offset="40%"  stopColor="#7c3aed" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="wc3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4c1d95" stopOpacity="0"/>
            <stop offset="50%"  stopColor="#a78bfa" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Ambient purple radiance in centre */}
        <ellipse cx="130" cy="52" rx="110" ry="36"
          fill="rgba(109,40,217,0.09)" filter="url(#gbloom)"/>

        {/* Wave 4 — deepest, wide soft */}
        <path d="M-10 72 Q30 44 65 62 T130 56 T195 62 T270 50"
          fill="none" stroke="url(#wc3)" strokeWidth="1"
          filter="url(#gcore)" opacity="0.5"/>

        {/* Wave 3 */}
        <path d="M-10 64 Q25 42 65 58 T130 48 T195 58 T270 42"
          fill="none" stroke="url(#wc2)" strokeWidth="1.5"
          filter="url(#gcore)" opacity="0.7"/>

        {/* Wave 2 — mid bright */}
        <path d="M-10 56 Q30 34 65 52 T130 42 T195 52 T270 36"
          fill="none" stroke="url(#wc1)" strokeWidth="2"
          filter="url(#gbloom)" opacity="0.9"/>

        {/* Wave 1 — brightest front */}
        <path d="M-10 68 Q20 48 55 62 T118 52 T185 62 T270 46"
          fill="none" stroke="url(#wc1)" strokeWidth="2.5"
          filter="url(#gbloom)" opacity="1"/>

        {/* Crossing diagonal wave */}
        <path d="M-10 38 Q55 58 115 36 T250 52"
          fill="none" stroke="url(#wc2)" strokeWidth="1"
          filter="url(#gcore)" opacity="0.55"/>

        {/* Particles */}
        {[
          [22,58,1.4,1],[48,44,1,0.8],[78,56,1.6,1],[105,40,1.2,0.9],
          [130,52,1.8,1],[155,42,1.2,0.9],[182,56,1.4,1],[210,44,1,0.8],[238,60,1.2,0.9],
        ].map(([cx,cy,r,op],i)=>(
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="#d8b4fe" opacity={op} filter="url(#gbloom)"/>
        ))}

        {/* Edge fade mask */}
        <rect x="0" y="0" width="260" height="96" fill="url(#fadeH)"/>
        {/* Top fade */}
        <rect x="0" y="0" width="260" height="28"
          fill="url(#fadeTop)"/>
        {/* Bottom fade */}
        <rect x="0" y="68" width="260" height="28"
          fill="url(#fadeBot)"/>
        <defs>
          <linearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d0d1a" stopOpacity="1"/>
            <stop offset="100%" stopColor="#0d0d1a" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="fadeBot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d0d1a" stopOpacity="0"/>
            <stop offset="100%" stopColor="#0d0d1a" stopOpacity="1"/>
          </linearGradient>
        </defs>
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
        padding:'10px 14px',
        borderRadius:12,
        textDecoration:'none',
        background: active
          ? danger ? 'rgba(220,38,38,0.12)' : 'rgba(88,28,220,0.20)'
          : 'transparent',
        border: active
          ? danger ? '1px solid rgba(248,113,113,0.12)' : '1px solid rgba(139,92,246,0.18)'
          : '1px solid transparent',
        transition:'all 0.15s ease',
        position:'relative',
      }}>
        {/* Icon */}
        <span style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0,
          color: active
            ? danger ? '#f87171' : '#a78bfa'
            : '#4a4a72',
          filter: active
            ? danger
              ? 'drop-shadow(0 0 6px rgba(248,113,113,0.7))'
              : 'drop-shadow(0 0 8px rgba(167,139,250,0.8)) drop-shadow(0 0 16px rgba(139,92,246,0.4))'
            : 'none',
          transition:'all 0.15s',
        }}>
          <ToolIcon toolKey={iconKey} size={19}/>
        </span>

        {/* Label */}
        <span style={{
          fontSize:14,
          fontWeight: active ? 600 : 400,
          color: active
            ? danger ? '#fca5a5' : '#e8e8f0'
            : '#9898b8',
          flex:1,
          letterSpacing:'-0.1px',
          lineHeight:1,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>
          {label}
        </span>

        {/* Badge */}
        {badge && (
          <span style={{
            fontSize:9, fontWeight:700, letterSpacing:'0.06em',
            padding:'2px 6px', borderRadius:999, flexShrink:0,
            background: badge==='HOT' ? 'rgba(251,146,60,0.15)' : badge==='ADMIN' ? 'rgba(220,38,38,0.15)' : 'rgba(52,211,153,0.12)',
            color: badge==='HOT' ? '#fb923c' : badge==='ADMIN' ? '#f87171' : '#34d399',
            border:`1px solid ${badge==='HOT' ? 'rgba(251,146,60,0.25)' : badge==='ADMIN' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
          }}>
            {badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside style={{
      width:248,
      flexShrink:0,
      display:'flex',
      flexDirection:'column',
      background:'#0d0d1a',
      borderRight:'1px solid rgba(255,255,255,0.05)',
      overflow:'hidden',
    }}>

      {/* ── Logo header ───────────────────────────────────────────────── */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        paddingTop:32, paddingBottom:0,
      }}>
        {/* Logo — no background, pure floating F with glow */}
        <div style={{ position:'relative', marginBottom:14 }}>
          {/* Wide ambient glow */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:160, height:160,
            background:'radial-gradient(ellipse, rgba(139,92,246,0.28) 0%, rgba(109,40,217,0.12) 40%, transparent 70%)',
            borderRadius:'50%',
            pointerEvents:'none',
          }}/>
          <img src={LOGO_BASE64} alt="Flow-Student"
            style={{
              width:96, height:96,
              objectFit:'contain',
              position:'relative', zIndex:1,
              filter:'drop-shadow(0 0 20px rgba(167,139,250,0.75)) drop-shadow(0 0 40px rgba(124,58,237,0.45)) drop-shadow(0 0 6px rgba(216,180,254,0.6))',
            }}/>
        </div>

        {/* Brand */}
        <div style={{
          fontSize:22, fontWeight:700, color:'#ffffff',
          letterSpacing:'-0.5px', lineHeight:1, marginBottom:6,
        }}>
          Flow-Student
        </div>

        {/* Tagline */}
        <div style={{
          fontSize:11.5, fontWeight:400,
          color:'rgba(196,181,253,0.65)',
          letterSpacing:'0.04em', lineHeight:1,
        }}>
          Humanized Writing AI
        </div>
      </div>

      {/* ── Luminescent wave ──────────────────────────────────────────── */}
      <LuminescentWave/>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav style={{ flex:1, overflowY:'auto', padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:2 }}>

        {/* Tools */}
        {TOOLS.map(tool =>
          navItem(`/dashboard/${tool.key}`, tool.key, tool.label, tool.badge)
        )}

        {/* Divider */}
        <div style={{ margin:'8px 4px', borderTop:'1px solid rgba(255,255,255,0.04)' }}/>

        {/* Account extras */}
        {NAV_EXTRAS.map(item =>
          navItem(item.href, item.iconKey, item.label)
        )}

        {/* Admin */}
        {isAdmin && navItem('/dashboard/admin','admin','Admin','ADMIN',true)}
      </nav>

      {/* ── Usage footer ─────────────────────────────────────────────── */}
      <div style={{
        borderTop:'1px solid rgba(255,255,255,0.05)',
        padding:'12px 14px', display:'flex', flexDirection:'column', gap:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:'50%', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg,#6d28d9,#a855f7)',
            fontSize:13, fontWeight:700, color:'#fff',
            boxShadow:'0 0 12px rgba(168,85,247,0.45)',
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

        {/* Word usage bar */}
        <div>
          <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:999, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:999, width:`${usagePct}%`,
              background: usagePct>90 ? '#f87171' : usagePct>70 ? '#fb923c' : 'linear-gradient(90deg,#6d28d9,#a855f7)',
              boxShadow: usagePct>90 ? '0 0 8px rgba(248,113,113,0.6)' : '0 0 8px rgba(168,85,247,0.5)',
              transition:'all 0.4s',
            }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#4a4a72', marginTop:6 }}>
            <span>
              {profile?.words_used?.toLocaleString()??0} / {(profile?.words_limit??0)>=999_999_999?'∞':profile?.words_limit?.toLocaleString()} words
            </span>
            {profile?.plan==='free' && (
              <Link href="/dashboard/billing" style={{ color:'#a855f7', fontWeight:600, textDecoration:'none', fontSize:11 }}>
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
