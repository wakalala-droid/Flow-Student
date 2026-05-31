'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { TOOLS } from '@/types'
import type { Profile } from '@/types'
import ToolIcon from '@/components/shared/ToolIcon'
import { LOGO_BASE64 } from '@/lib/logo'

const NAV_EXTRAS = [
  { href: '/dashboard/documents', iconKey: 'documents', label: 'Documents'  },
  { href: '/dashboard/billing',   iconKey: 'billing',   label: 'Billing'    },
  { href: '/dashboard/settings',  iconKey: 'settings',  label: 'Settings'   },
]

// ── Purple wave SVG matching the splash screen ───────────────────────────────
function PurpleWave() {
  return (
    <div style={{ position:'relative', width:'100%', height:72, overflow:'hidden', marginTop:-4, flexShrink:0 }}>
      <svg viewBox="0 0 232 72" preserveAspectRatio="none"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur1"/>
            <feGaussianBlur stdDeviation="7" result="blur2"/>
            <feMerge><feMergeNode in="blur2"/><feMergeNode in="blur1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow2" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4c1d95" stopOpacity="0"/>
            <stop offset="25%"  stopColor="#7c3aed" stopOpacity="0.9"/>
            <stop offset="60%"  stopColor="#a855f7" stopOpacity="1"/>
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#6d28d9" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#8b5cf6" stopOpacity="0.7"/>
            <stop offset="70%"  stopColor="#c084fc" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="wg3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3b0764" stopOpacity="0"/>
            <stop offset="40%"  stopColor="#7e22ce" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Background glow blob */}
        <ellipse cx="116" cy="44" rx="90" ry="28" fill="rgba(124,58,237,0.12)" filter="url(#glow2)"/>

        {/* Wave 3 — deep back */}
        <path d="M0 52 Q29 36 58 48 T116 44 T174 40 T232 52" fill="none" stroke="url(#wg3)" strokeWidth="1" filter="url(#glow2)" opacity="0.6"/>

        {/* Wave 2 — mid */}
        <path d="M0 48 Q29 32 58 44 T116 36 T174 44 T232 48" fill="none" stroke="url(#wg2)" strokeWidth="1.5" filter="url(#glow)" opacity="0.85"/>

        {/* Wave 1 — front bright */}
        <path d="M0 56 Q29 40 58 52 T116 44 T174 52 T232 44" fill="none" stroke="url(#wg1)" strokeWidth="2" filter="url(#glow)" opacity="1"/>

        {/* Particles */}
        {[
          [28,38,1.2,0.9],[58,30,1,0.7],[88,44,1.5,1],[116,28,1.2,0.8],
          [144,40,1,0.9],[172,32,1.4,1],[200,46,1,0.7],[220,36,1.2,0.85],
        ].map(([cx,cy,r,o],i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#c084fc" opacity={o} filter="url(#glow2)"/>
        ))}

        {/* Fade top */}
        <rect x="0" y="0" width="232" height="24" fill="url(#fadeTop)"/>
        <defs>
          <linearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111118" stopOpacity="1"/>
            <stop offset="100%" stopColor="#111118" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="fadeBot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111118" stopOpacity="0"/>
            <stop offset="100%" stopColor="#111118" stopOpacity="1"/>
          </linearGradient>
        </defs>
        {/* Fade bottom */}
        <rect x="0" y="52" width="232" height="20" fill="url(#fadeBot)"/>
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
    fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.isAdmin))
  }, [])

  return (
    <aside className="w-[232px] flex-shrink-0 flex flex-col bg-[#0d0d14] border-r border-white/[0.06] overflow-hidden">

      {/* ── Header — logo + wave ─────────────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:28, paddingBottom:0, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        {/* Logo image — glowing exposure */}
        <div style={{ position:'relative', width:88, height:88, marginBottom:10 }}>
          {/* Ambient glow behind logo */}
          <div style={{
            position:'absolute', inset:-16,
            background:'radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, transparent 70%)',
            borderRadius:'50%',
            filter:'blur(8px)',
          }}/>
          <img
            src={LOGO_BASE64}
            alt="Flow-Student"
            style={{ width:88, height:88, objectFit:'contain', position:'relative', zIndex:1, filter:'drop-shadow(0 0 18px rgba(168,85,247,0.7)) drop-shadow(0 0 36px rgba(124,58,237,0.4))' }}
          />
        </div>

        {/* Brand name */}
        <div style={{ fontSize:20, fontWeight:700, color:'#ffffff', letterSpacing:'-0.4px', lineHeight:1, marginBottom:5 }}>
          Flow-Student
        </div>
        {/* Tagline */}
        <div style={{ fontSize:11, fontWeight:400, color:'rgba(196,181,253,0.7)', letterSpacing:'0.04em', marginBottom:0 }}>
          Humanized Writing AI
        </div>

        {/* Purple wave */}
        <PurpleWave />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-px">
        <p className="px-2 pt-2 pb-1.5 text-[10px] font-semibold text-[#4a4a6a] uppercase tracking-[0.1em]">Tools</p>

        {TOOLS.map(tool => {
          const href   = `/dashboard/${tool.key}`
          const active = pathname === href
          return (
            <Link key={tool.key} href={href}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'8px 10px',
                borderRadius:10,
                textDecoration:'none',
                transition:'all 0.15s',
                background: active ? 'rgba(109,40,217,0.18)' : 'transparent',
                border: active ? '1px solid rgba(139,92,246,0.15)' : '1px solid transparent',
              }}
              className="group"
            >
              {/* Icon — purple glow when active */}
              <span style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:32, height:32, borderRadius:9, flexShrink:0,
                background: active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                color: active ? '#c084fc' : '#5a5a8a',
                filter: active ? 'drop-shadow(0 0 6px rgba(192,132,252,0.6))' : 'none',
                transition:'all 0.15s',
              }}>
                <ToolIcon toolKey={tool.key} size={17} />
              </span>

              {/* Label */}
              <span style={{
                fontSize:13, fontWeight: active ? 600 : 500,
                color: active ? '#e8e8f0' : '#7a7a9a',
                flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                lineHeight:1,
              }}>
                {tool.label}
              </span>

              {/* Badge */}
              {tool.badge && (
                <span style={{
                  fontSize:9, fontWeight:700, letterSpacing:'0.05em',
                  padding:'2px 6px', borderRadius:999, flexShrink:0,
                  background: tool.badge === 'HOT' ? 'rgba(251,146,60,0.15)' : 'rgba(52,211,153,0.12)',
                  color:       tool.badge === 'HOT' ? '#fb923c' : '#34d399',
                  border: `1px solid ${tool.badge === 'HOT' ? 'rgba(251,146,60,0.2)' : 'rgba(52,211,153,0.2)'}`,
                }}>
                  {tool.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div style={{ margin:'6px 4px', borderTop:'1px solid rgba(255,255,255,0.04)' }} />
        <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold text-[#4a4a6a] uppercase tracking-[0.1em]">Account</p>

        {NAV_EXTRAS.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'8px 10px', borderRadius:10, textDecoration:'none', transition:'all 0.15s',
              background: active ? 'rgba(109,40,217,0.18)' : 'transparent',
              border: active ? '1px solid rgba(139,92,246,0.15)' : '1px solid transparent',
            }} className="group">
              <span style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:32, height:32, borderRadius:9, flexShrink:0,
                background: active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                color: active ? '#c084fc' : '#5a5a8a',
                filter: active ? 'drop-shadow(0 0 6px rgba(192,132,252,0.6))' : 'none',
                transition:'all 0.15s',
              }}>
                <ToolIcon toolKey={item.iconKey} size={17} />
              </span>
              <span style={{ fontSize:13, fontWeight: active ? 600 : 500, color: active ? '#e8e8f0' : '#7a7a9a', lineHeight:1 }}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {isAdmin && (
          <Link href="/dashboard/admin" style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'8px 10px', borderRadius:10, textDecoration:'none', transition:'all 0.15s',
            background: pathname === '/dashboard/admin' ? 'rgba(220,38,38,0.12)' : 'transparent',
            border: pathname === '/dashboard/admin' ? '1px solid rgba(248,113,113,0.15)' : '1px solid transparent',
          }} className="group">
            <span style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              width:32, height:32, borderRadius:9, flexShrink:0,
              background: pathname === '/dashboard/admin' ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.03)',
              color: pathname === '/dashboard/admin' ? '#f87171' : '#5a5a8a',
              filter: pathname === '/dashboard/admin' ? 'drop-shadow(0 0 6px rgba(248,113,113,0.5))' : 'none',
              transition:'all 0.15s',
            }}>
              <ToolIcon toolKey="admin" size={17} />
            </span>
            <span style={{ fontSize:13, fontWeight:500, color: pathname === '/dashboard/admin' ? '#fca5a5' : '#7a7a9a', flex:1, lineHeight:1 }}>Admin</span>
            <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:'rgba(220,38,38,0.15)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)' }}>ADMIN</span>
          </Link>
        )}
      </nav>

      {/* ── Usage footer ─────────────────────────────────────────────────── */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:'50%', flexShrink:0, display:'flex',
            alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg,#7c3aed,#a855f7)',
            fontSize:13, fontWeight:700, color:'#fff',
            boxShadow:'0 0 10px rgba(168,85,247,0.4)',
          }}>
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#e8e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:1 }}>
              {profile?.full_name ?? 'User'}
            </div>
            <div style={{ fontSize:11, color:'#5a5a8a', textTransform:'capitalize', marginTop:3 }}>
              {profile?.plan ?? 'free'} plan
            </div>
          </div>
        </div>

        <div>
          <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:999, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:999,
              width:`${usagePct}%`,
              background: usagePct > 90 ? '#f87171' : usagePct > 70 ? '#fb923c' : 'linear-gradient(90deg,#6d28d9,#a855f7)',
              boxShadow: usagePct > 90 ? '0 0 8px rgba(248,113,113,0.5)' : '0 0 8px rgba(168,85,247,0.4)',
              transition:'all 0.4s',
            }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#5a5a8a', marginTop:6 }}>
            <span>
              {profile?.words_used?.toLocaleString() ?? 0}
              {' / '}
              {(profile?.words_limit ?? 0) >= 999_999_999 ? '∞' : profile?.words_limit?.toLocaleString()} words
            </span>
            {profile?.plan === 'free' && (
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
