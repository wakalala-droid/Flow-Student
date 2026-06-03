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


function NavItem({ href, iconKey, label, badge, danger = false, active }: {
  href:string; iconKey:string; label:string
  badge?:string; danger?:boolean; active:boolean
}) {
  return (
    <Link href={href} style={{
      display:'flex', alignItems:'center', gap:13,
      padding:'9px 12px', borderRadius:11, textDecoration:'none',
      background: active
        ? danger ? 'rgba(220,38,38,0.12)' : 'rgba(92,69,255,0.17)'
        : 'transparent',
      border: active
        ? danger ? '1px solid rgba(248,113,113,0.12)' : '1px solid rgba(124,92,255,0.20)'
        : '1px solid transparent',
      transition:'all 0.14s ease',
    }}>
      <span style={{
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        color: active ? danger ? '#f87171' : '#B388FF' : '#38385e',
        filter: active
          ? danger
            ? 'drop-shadow(0 0 6px rgba(248,113,113,0.7))'
            : 'drop-shadow(0 0 8px rgba(179,136,255,1)) drop-shadow(0 0 16px rgba(124,92,255,0.55))'
          : 'none',
        transition:'all 0.14s',
      }}>
        <ToolIcon toolKey={iconKey} size={18}/>
      </span>
      <span style={{
        fontSize:13.5, fontWeight: active ? 600 : 400,
        color: active ? danger ? '#fca5a5' : '#e8e8f0' : '#72728e',
        flex:1, letterSpacing:'-0.1px', lineHeight:1,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
      }}>
        {label}
      </span>
      {badge && (
        <span style={{
          fontSize:9, fontWeight:700, letterSpacing:'0.06em',
          padding:'2px 6px', borderRadius:999, flexShrink:0,
          background: badge==='HOT' ? 'rgba(251,146,60,0.15)' : badge==='ADMIN' ? 'rgba(220,38,38,0.15)' : 'rgba(52,211,153,0.1)',
          color:       badge==='HOT' ? '#fb923c'              : badge==='ADMIN' ? '#f87171'              : '#34d399',
          border:`1px solid ${badge==='HOT' ? 'rgba(251,146,60,0.25)' : badge==='ADMIN' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.18)'}`,
        }}>
          {badge}
        </span>
      )}
    </Link>
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
        background:'#0A0914', borderRight:'1px solid rgba(92,69,255,0.09)',
        overflow:'hidden',
      }}>

        {/* Logo + brand */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:28 }}>
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
            {/* Ambient radiance */}
            <div style={{
              position:'absolute', width:210, height:170,
              background:'radial-gradient(ellipse at 50% 52%, rgba(124,92,255,0.22) 0%, rgba(90,69,255,0.08) 48%, transparent 70%)',
              borderRadius:'50%', pointerEvents:'none',
            }}/>
            <img
              src={LOGO_BASE64}
              alt="Flow-Student"
              style={{
                width:96, height:96, objectFit:'contain',
                position:'relative', zIndex:1,
                borderRadius:20,
                filter:'drop-shadow(0 0 18px rgba(179,136,255,0.7)) drop-shadow(0 0 36px rgba(124,92,255,0.4))',
              }}
            />
          </div>

          {/* Brand — gradient text matching landing nav */}
          <div style={{
            fontSize:22, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1,
            background:'linear-gradient(135deg,#e8e8f0 0%,#c4b5fd 35%,#a78bfa 65%,#e8e8f0 100%)',
            backgroundSize:'220% 220%',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'fsGrad 4s ease infinite', marginBottom:7,
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


        {/* Nav */}
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
            <NavItem href="/dashboard/admin" iconKey="admin" label="Admin"
              badge="ADMIN" danger active={pathname === '/dashboard/admin'}
            />
          )}
        </nav>

        {/* Footer */}
        <div style={{ borderTop:'1px solid rgba(92,69,255,0.07)', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
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
