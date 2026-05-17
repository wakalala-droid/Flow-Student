# Flow-Student AI Writing Suite

A production-ready AI SaaS platform for students — built with Next.js 14, Supabase, Groq AI (free), and Flutterwave Mobile Money (MTN/Airtel/Zamtel).

---

## 🚀 Tech Stack

| Layer       | Technology |
|-------------|-----------|
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth        | Supabase Auth (email + Google OAuth) |
| Database    | Supabase Postgres (with RLS) |
| AI Engine   | Groq API — Llama 3.3 70B (free tier) |
| Payments    | Flutterwave — MTN Money, Airtel Money, Zamtel |
| Hosting     | Vercel (free tier) |

---

## 🛠 10 AI Tools

1. **AI Humanizer** — Makes AI text sound natural with style modes
2. **AI Detector** — Sentence-level heatmap + model breakdown
3. **Plagiarism Checker** — Semantic similarity detection
4. **Paraphraser** — 8 rewrite modes with intensity control
5. **Grammar Fixer** — Full proofreading with issue explanations
6. **Fact Checker** — Claim extraction and verification
7. **SEO Optimizer** — Full checklist + keyword suggestions
8. **Tone Rewriter** — 7 tone modes (Professional → Gen Z)
9. **Citation Generator** — APA, MLA, Chicago, Harvard, Vancouver, IEEE
10. **Documents** — Full history of all scans

---

## 📦 Project Structure

```
flow-student/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx          ← Protected layout with sidebar
│   │   ├── humanizer/page.tsx
│   │   ├── detector/page.tsx
│   │   ├── plagiarism/page.tsx
│   │   ├── paraphraser/page.tsx
│   │   ├── grammar/page.tsx
│   │   ├── factcheck/page.tsx
│   │   ├── seo/page.tsx
│   │   ├── tone/page.tsx
│   │   ├── citation/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── billing/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── humanize/route.ts
│   │   ├── detect/route.ts
│   │   ├── plagiarism/route.ts
│   │   ├── paraphrase/route.ts
│   │   ├── grammar/route.ts
│   │   ├── factcheck/route.ts
│   │   ├── seo/route.ts
│   │   ├── tone/route.ts
│   │   ├── citation/route.ts
│   │   ├── payment/
│   │   │   ├── initiate/route.ts
│   │   │   └── verify/route.ts
│   │   ├── auth/callback/route.ts
│   │   └── user/usage/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── tools/
│   │   └── ToolShell.tsx       ← Shared tool wrapper
│   └── shared/
│       └── ScoreCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── grok/
│   │   └── client.ts           ← Groq AI client
│   ├── engines/
│   │   ├── humanizer.ts
│   │   ├── detector.ts
│   │   ├── grammar.ts
│   │   ├── paraphraser.ts
│   │   ├── factcheck.ts
│   │   ├── seo.ts
│   │   ├── tone.ts
│   │   └── citation.ts
│   ├── payment/
│   │   └── flutterwave.ts      ← Mobile Money integration
│   └── utils/index.ts
├── hooks/
│   ├── useAuth.ts
│   └── useTool.ts
├── types/index.ts
├── middleware.ts
├── supabase/migrations/001_schema.sql
├── .env.local                  ← Copy to fill in your keys
├── .env.example
└── vercel.json
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/flow-student.git
cd flow-student
npm install
```

### 2. Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Go to **SQL Editor** → paste contents of `supabase/migrations/001_schema.sql` → Run
4. Go to **Authentication → Providers** → Enable Google OAuth (optional)

### 3. Get Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up → Create API Key
3. Free tier includes generous rate limits with Llama 3.3 70B

### 4. Set Up Flutterwave (Mobile Money)

1. Go to [dashboard.flutterwave.com](https://dashboard.flutterwave.com)
2. Sign up → Settings → API Keys
3. Copy **Secret Key**, **Public Key**, and **Encryption Key**
4. In Dashboard → Webhooks, add: `https://your-app.vercel.app/api/payment/verify`

### 5. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GROQ_API_KEY=gsk_your_groq_key

FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your_key
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deploy to Vercel (Free)

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### Option B: GitHub Integration

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Repository
3. Add all environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy

**After deploy, update:**
- `NEXT_PUBLIC_APP_URL` → your Vercel URL
- Flutterwave webhook → `https://your-app.vercel.app/api/payment/verify`
- Supabase Auth → Site URL → your Vercel URL

---

## 💳 Pricing (ZMW)

| Plan    | Monthly | Yearly | Words/mo | Scans/mo |
|---------|---------|--------|----------|----------|
| Free    | —       | —      | 5,000    | 10       |
| Student | ZMW 49  | ZMW 490| 20,000   | 50       |
| Pro     | ZMW 99  | ZMW 990| 50,000   | 200      |
| Team    | ZMW 249 | ZMW 2,490 | 200,000 | 1,000  |

Payments via MTN Mobile Money, Airtel Money, and Zamtel Kwacha.

---

## 🔑 API Keys Summary

| Service       | Free Tier        | Sign Up |
|---------------|-----------------|---------|
| Supabase      | 500MB DB, 50k MAU | supabase.com |
| Groq AI       | 14,400 req/day   | console.groq.com |
| Flutterwave   | Pay-per-transaction (1.4%) | dashboard.flutterwave.com |
| Vercel        | 100GB bandwidth  | vercel.com |

---

## 🔒 Security Features

- Row Level Security on all Supabase tables
- Server-side auth validation on every API route
- Word limit enforcement via Postgres function
- Input sanitization in all engines
- HTTPS enforced via Vercel

---

## 📈 Scaling Notes

- Groq free tier: ~14,400 requests/day — sufficient for hundreds of daily users
- Upgrade to Groq paid when needed (~$0.59 per million tokens)
- Supabase free tier: 500MB storage, 2GB transfer — upgrade at $25/mo
- Vercel free: 100GB bandwidth — upgrade at $20/mo

---

## 🛟 Support

- Email: support@flow-student.com
- Built for Zambian students and beyond 🇿🇲
