# ThePaywall

A crypto paywall platform for creators. Lock links, bundles, and files behind BTC, ETH, SOL, XRP, or USDT payments. No KYC. No banks.

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Prisma · NOWPayments

---

## Features

- **Creator dashboard** — create, manage, and share paywall items
- **3 content types** — single link, bundle of links, or downloadable file
- **Crypto payments** — BTC, ETH, SOL, XRP, USDT (TRC-20) via NOWPayments
- **Auto-unlock** — content delivered instantly on payment confirmation
- **Anonymous accounts** — email + password only, no KYC
- **Permanent access** — buyers keep access forever via unique token URL

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd thepaywall
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In **Storage**, create a bucket called `paywall-files` and set it to **public**
3. Copy your project URL, anon key, and service role key

### 3. Set up NOWPayments

1. Sign up at [nowpayments.io](https://nowpayments.io)
2. Add your crypto wallet addresses in your NOWPayments account settings
3. Copy your API key from the dashboard
4. Set your IPN secret (Settings → IPN)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (from Supabase → Settings → Database)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# NOWPayments
NOWPAYMENTS_API_KEY=your-api-key
NOWPAYMENTS_IPN_SECRET=your-ipn-secret

# App URL (use ngrok for local webhook testing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set up the database

```bash
npm run db:push        # Push schema to Supabase
npm run db:generate    # Generate Prisma client
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Testing Payments Locally

NOWPayments webhooks need a public URL. Use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Set `NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app` in `.env.local` and restart.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Creator login
│   ├── signup/page.tsx             # Creator signup
│   ├── dashboard/
│   │   ├── page.tsx                # Item list
│   │   └── new/page.tsx            # Create item form
│   ├── pay/[slug]/page.tsx         # Public payment page
│   ├── access/[token]/page.tsx     # Content delivery page
│   └── api/
│       ├── auth/                   # Signup helper
│       ├── items/                  # CRUD + by-slug lookup
│       ├── payments/               # Create, status poll, webhook
│       └── upload/                 # File upload to Supabase Storage
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/                     # Navbar, Footer
│   ├── auth/                       # Login/signup forms
│   ├── dashboard/                  # ItemCard, CreateItemForm
│   └── payment/                    # PaymentModal, CountdownTimer
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── supabase/                   # Server + client helpers
│   ├── nowpayments.ts              # NOWPayments API wrapper
│   └── utils.ts                    # cn, slug, formatting
└── types/index.ts                  # Shared types
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables (same as `.env.local`)
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel production URL
5. Deploy — Vercel runs `prisma generate && next build` automatically

After first deploy, update your NOWPayments IPN callback URL to:
```
https://your-domain.vercel.app/api/payments/webhook
```

---

## Database Schema

```
User          — id (Supabase auth UID), email
PaywallItem   — id, userId, type (LINK|BUNDLE|FILE), title, description,
                slug, priceUSD, linkUrl?, fileUrl?
BundleLink    — id, itemId, url, label, order
Payment       — id, itemId, nowpaymentsId, status, cryptoCurrency,
                amountCrypto, amountUSD, buyerEmail?, accessToken
```

---

## Payment Flow

```
Buyer visits /pay/[slug]
  → selects crypto + optional email
  → POST /api/payments/create
    → NOWPayments API creates payment → unique pay address + amount
    → Payment row created in DB with accessToken (UUID)
  → PaymentModal shows address + countdown (15 min)
  → Client polls GET /api/payments/status/[nowpaymentsId] every 12s
  → NOWPayments webhook POST /api/payments/webhook updates status
  → On confirmed/finished → redirect to /access/[accessToken]
```

---

## Adding Stripe Later

Payment logic is isolated in:
- `src/lib/nowpayments.ts` — NOWPayments client
- `src/app/api/payments/` — create, status, webhook routes

To add Stripe, add a parallel set of routes and a payment method selector on the pay page.
