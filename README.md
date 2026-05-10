# WorkspaceFlow

A real-time project management platform for teams who want to move fast without losing track of anything. Built as a production-grade SaaS — not a tutorial app.

Think Linear's speed, Notion's flexibility, and Plane's open design — in one dark-mode workspace that actually works.

---

## What it does

You create a workspace, invite your team, and get a fully functional project management environment:

- Drag tasks across a Kanban board that updates live for every teammate
- Write docs that sync in real time as you type
- Comment on tasks with live typing indicators — you can see who's writing
- Invite members by email, manage roles, remove people
- Connect Slack, GitHub, or Discord to pipe task activity into your tools
- Ask Claude to summarize your entire workspace, generate a standup, or prioritize your backlog
- Get AI-written task descriptions with one click in the task detail panel
- Use the Cmd+K command palette to jump anywhere instantly
- Track progress in an analytics dashboard with charts and a 30-day history
- Upgrade to Pro with Stripe — billing, webhooks, customer portal all wired up

---

## Tech stack

| What | How |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript — strict mode throughout |
| Database | PostgreSQL via Prisma v7 |
| Auth | NextAuth v5 — Google, GitHub, email+password |
| Real-time | Socket.io v4 on a custom Node server |
| AI | Anthropic Claude (Opus for summaries, Haiku for task descriptions) |
| Payments | Stripe — Checkout, webhooks, customer portal |
| Styling | Tailwind CSS v4 |
| Drag and drop | @hello-pangea/dnd |
| Charts | Recharts |
| Animations | Framer Motion |
| State | Zustand |
| Validation | Zod v4 |

---

## Project structure

```
workspace-flow/
├── prisma/
│   └── schema.prisma              # Database schema — all models
├── server.ts                      # Custom Node server (Next.js + Socket.io)
├── src/
│   ├── app/
│   │   ├── (auth)/                # Login and register pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/                 # Authenticated app shell
│   │   │   ├── dashboard/         # Workspace list + create flow
│   │   │   └── workspace/[slug]/  # Everything inside a workspace
│   │   │       ├── page.tsx       # Kanban board
│   │   │       ├── docs/          # Document editor
│   │   │       ├── members/       # Team management
│   │   │       ├── analytics/     # Charts + AI insights
│   │   │       ├── integrations/  # Slack · GitHub · Discord
│   │   │       └── settings/      # Workspace config
│   │   ├── api/
│   │   │   ├── auth/              # NextAuth handlers + register
│   │   │   ├── workspaces/[id]/   # Tasks · Docs · Members · Invite
│   │   │   │   ├── tasks/
│   │   │   │   ├── docs/
│   │   │   │   ├── members/
│   │   │   │   ├── invite/
│   │   │   │   ├── integrations/
│   │   │   │   ├── analytics/
│   │   │   │   ├── activity/
│   │   │   │   └── ai/            # Workspace summary + task description
│   │   │   ├── tasks/[id]/        # Task patch + comments
│   │   │   └── stripe/            # Checkout · Webhook · Portal
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # Button, Input, Dialog, Badge, etc.
│   │   ├── layout/
│   │   │   └── workspace-sidebar.tsx
│   │   ├── tasks/
│   │   │   └── task-detail-modal.tsx
│   │   └── command-palette.tsx
│   ├── hooks/
│   │   └── use-socket.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── stripe.ts
│   │   ├── anthropic.ts
│   │   └── utils.ts
│   ├── store/                     # Zustand global state
│   └── types/                     # Shared TypeScript types
└── .env                           # See setup below
```

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or hosted — Supabase, Neon, Railway all work)
- A Stripe account
- An Anthropic API key for the AI features
- A Google or GitHub OAuth app (or both)

### 1. Clone and install

```bash
git clone https://github.com/thribhuvan003/workspace-flow.git
cd workspace-flow
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/workspaceflow"

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub OAuth — github.com/settings/developers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe — dashboard.stripe.com
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Anthropic — console.anthropic.com
ANTHROPIC_API_KEY="sk-ant-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npm run db:push
```

This runs Prisma's schema push against your PostgreSQL database and generates the client. No migrations needed for a fresh setup.

### 4. Run it

```bash
npm run dev
```

This starts the custom Socket.io server on top of Next.js. Open [http://localhost:3000](http://localhost:3000).

---

## How the real-time layer works

Next.js App Router doesn't support WebSockets natively, so there's a custom `server.ts` that wraps Next.js's request handler with a plain Node HTTP server and Socket.io on top.

When a user opens a workspace, the client joins a Socket.io room keyed to that workspace ID. Any action — moving a task, adding a comment, editing a doc — emits an event to that room. Every other connected client in the workspace receives it instantly.

Events: `task-moved`, `task-created`, `comment-added`, `doc-updated`, `typing-start`, `typing-stop`

---

## How the database connection works

Prisma v7 dropped the `url` field from datasource blocks in `schema.prisma`. The connection now goes through a driver adapter:

```typescript
// src/lib/prisma.ts
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

---

## Multi-tenancy and security

Every single API route checks that the requesting user is a member of the workspace before touching any data. Owner-only operations (managing integrations, removing members, changing settings) have an additional role check.

There are no shared database queries. Every query is scoped to a specific `workspaceId`. Guests can read but not write. Members can create and update. Owners control everything.

---

## AI features

The Anthropic integration lives in `src/lib/anthropic.ts` and is used in two places:

**Workspace summary** (`/api/workspaces/[id]/ai`) — takes your task list, activity log, member count, and doc titles, builds a prompt, and asks Claude Opus to write an executive summary, a standup update, or a backlog prioritization. The result is saved to the database so you have a history.

**Task description** (`/api/workspaces/[id]/ai/task`) — takes the task title, priority, and labels and asks Claude Haiku to write a concise, professional description. Haiku is used here because it's fast and cheap for this kind of short generation.

---

## Stripe setup

For local development, forward Stripe webhooks using the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The webhook handler processes `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` to keep the `Subscription` table in sync.

---

## Deployment

The app runs on any Node.js host — Railway, Render, Fly.io, or a plain VPS. Vercel is not ideal because Socket.io needs a persistent server, not serverless functions.

```bash
npm run build
npm start
```

Set all environment variables in your host's dashboard. Make sure `NEXTAUTH_URL` matches your production domain.

---

## Scripts

```bash
npm run dev          # Start dev server (Next.js + Socket.io)
npm run build        # Production build
npm run start        # Start production server
npm run db:push      # Push Prisma schema to database
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run lint         # Run ESLint
```

---

## What's next

A few things that could make this even better but weren't in scope for this build:

- Email notifications when you're assigned a task or mentioned in a comment
- File attachments on tasks and docs
- Keyboard shortcuts beyond Cmd+K (j/k navigation on the board, etc.)
- TabMind integration — auto-create tasks from your browser tabs

---

Built with Next.js, Prisma, Socket.io, and Anthropic Claude.
