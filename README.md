# WorkspaceFlow

A production-grade SaaS project management platform — built to be résumé-worthy, not tutorial-level.

Real-time Kanban boards, collaborative docs, AI-powered insights, team management, and payment billing — all in one dark-mode workspace. The kind of project that actually gets you the interview.

---

## Live Features

- **Kanban board** with drag-and-drop, live sync, and task assignments across all teammates simultaneously
- **Collaborative docs** that update character-by-character in real time as you type
- **Task comments** with live typing indicators — you can see exactly who's writing before they hit send
- **Team management** — invite by email, set roles (Owner / Member / Guest), remove people
- **Third-party integrations** — Slack, GitHub, Discord for piping task activity into your existing tools
- **AI workspace insights** — ask Gemini to summarize your entire workspace, generate a standup, or prioritize your backlog
- **AI task descriptions** — one click generates a professional task description from just the title
- **Cmd+K command palette** — keyboard-first navigation to anywhere in the app instantly
- **Analytics dashboard** — area charts, pie charts, 30-day velocity, completion rates
- **Payments with Razorpay** — Pro plan billing, webhook handling, and subscription state management
- **Multi-workspace support** — one account, many workspaces, each isolated

---

## Tech Stack

| Layer | Technology | Why this choice |
|---|---|---|
| Framework | Next.js 16 (App Router) | RSCs reduce client JS, built-in routing, middleware |
| Language | TypeScript (strict) | Catches entire categories of bugs at compile time |
| Database | PostgreSQL + Prisma v7 | Type-safe queries; schema-as-code prevents drift |
| Auth | NextAuth v5 | Battle-tested; supports Google, GitHub, and email |
| Real-time | Socket.io v4 | Reliable WebSocket abstraction with rooms and reconnect |
| AI | Google Gemini (Pro + Flash) | Pro for detailed summaries, Flash for fast task descriptions |
| Payments | Razorpay | India-first payment gateway with solid webhook support |
| Styling | Tailwind CSS v4 | Zero-runtime CSS; new `@theme` API eliminates the config file |
| Animations | Framer Motion | Declarative variants keep animation logic readable |
| Drag & Drop | @hello-pangea/dnd | Accessible, well-maintained fork of react-beautiful-dnd |
| Charts | Recharts | Composable chart primitives built on top of D3 |
| State | Zustand | Minimal boilerplate for global client state |
| Validation | Zod v4 | Schema validation at API boundaries; shared types between layers |

---

## Architecture Decisions

### Why a custom Node server instead of Vercel?

Next.js App Router doesn't support persistent WebSocket connections — serverless functions die after each request. The custom `server.ts` wraps Next.js's request handler with a plain Node HTTP server, then attaches Socket.io on top of the same port. This means one process handles both HTTP and WebSocket traffic with zero extra infrastructure.

### How real-time sync works

When a user opens a workspace, their client joins a Socket.io room scoped to `workspaceId`. Every mutation (moving a task, adding a comment, editing a doc) emits an event to that room server-side. All connected clients in the same workspace receive the update within milliseconds without polling.

Events: `task-moved`, `task-created`, `comment-added`, `doc-updated`, `typing-start`, `typing-stop`

### Database connection with Prisma v7

Prisma v7 removed the `url` field from datasource blocks. The connection now goes through a driver adapter:

```typescript
// src/lib/prisma.ts
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

This pattern avoids Prisma spinning up a separate connection pool and gives direct access to the underlying `pg` pool when needed.

### Multi-tenancy and security

Every single API route verifies workspace membership before touching any data. The pattern is consistent:

```typescript
const access = await prisma.workspaceMember.findUnique({
  where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
});
if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

Owner-only operations (managing integrations, removing members, payment actions) have an additional role check. There are no cross-tenant data leaks by design — every query is scoped to a specific `workspaceId`.

### AI integration

Two separate Gemini models handle different latency requirements:

- **Workspace summaries** use `gemini-1.5-pro` — higher quality output for executive reports, standups, and backlog analysis. Results are persisted in the database so teams have a history.
- **Task descriptions** use `gemini-1.5-flash` — fast, cheap, single-pass generation from just a task title and priority. Response time under 1s in practice.

### Payment flow (Razorpay)

The billing flow is a three-step process:

1. Backend creates a Razorpay order via server-side SDK call
2. Frontend loads the Razorpay checkout script and opens the modal with the order ID
3. On payment success, frontend sends `{ orderId, paymentId, signature }` to `/api/razorpay/verify` — the backend computes `HMAC-SHA256(orderId|paymentId)` and compares it against the signature before updating the subscription

Webhooks at `/api/razorpay/webhook` handle async events like `payment.captured` and `subscription.cancelled` to keep database state consistent with Razorpay's records.

---

## Project Structure

```
workspace-flow/
├── prisma/
│   └── schema.prisma              # Full DB schema — 12 models
├── server.ts                      # Custom Node server (Next.js + Socket.io)
├── src/
│   ├── app/
│   │   ├── (auth)/                # Login + register pages
│   │   ├── (app)/                 # Authenticated shell
│   │   │   ├── dashboard/         # Workspace list + create flow
│   │   │   ├── billing/           # Razorpay billing + plan comparison
│   │   │   └── workspace/[slug]/  # The main workspace
│   │   │       ├── page.tsx       # Kanban board
│   │   │       ├── docs/          # Real-time document editor
│   │   │       ├── members/       # Team management
│   │   │       ├── analytics/     # Charts + AI insights
│   │   │       ├── integrations/  # Slack · GitHub · Discord
│   │   │       └── settings/      # Workspace config + danger zone
│   │   └── api/
│   │       ├── auth/              # NextAuth handlers + email register
│   │       ├── workspaces/[id]/   # Tasks · Docs · Members · Invite · AI
│   │       ├── tasks/[id]/        # Task PATCH + comments
│   │       ├── razorpay/          # order · verify · webhook
│   │       └── subscriptions/     # Create payment order
│   ├── components/
│   │   ├── ui/                    # Button, Input, Dialog, Badge, etc.
│   │   ├── layout/
│   │   │   └── workspace-sidebar.tsx
│   │   ├── tasks/
│   │   │   └── task-detail-modal.tsx
│   │   └── command-palette.tsx    # Cmd+K with keyboard navigation
│   ├── hooks/
│   │   └── use-socket.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── gemini.ts              # Gemini Pro + Flash clients
│   │   ├── razorpay.ts            # Razorpay client + PLANS config
│   │   └── utils.ts
│   ├── store/                     # Zustand global state
│   └── types/                     # Shared TypeScript interfaces
└── .env
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local, Supabase, Neon, or Railway all work)
- A Razorpay account (for billing features)
- A Google AI Studio API key (for AI features)
- Google and/or GitHub OAuth app credentials

### 1. Clone and install

```bash
git clone https://github.com/thribhuvan003/workspace-flow.git
cd workspace-flow
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/workspaceflow"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub OAuth — github.com/settings/developers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Razorpay — dashboard.razorpay.com
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

# Google Gemini — aistudio.google.com
GEMINI_API_KEY="..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

### 3. Set up the database

```bash
npm run db:push
```

Prisma pushes the schema to your PostgreSQL database and generates the client. No migrations needed for a fresh setup.

### 4. Run the development server

```bash
npm run dev
```

Opens [http://localhost:3000](http://localhost:3000). The custom Socket.io server starts alongside Next.js on the same port.

---

## Real-time Architecture Deep Dive

The WebSocket layer is built on Socket.io rooms, not broadcasts. When a client opens `/workspace/my-project`, the client emits `join-workspace` with the workspace ID. The server adds that socket to a room keyed by the ID.

When any client mutates state (drag a task, post a comment), the handler:
1. Writes the change to PostgreSQL
2. Emits the event to the workspace room: `io.to(workspaceId).emit("task-moved", data)`
3. Returns the HTTP 200

All other connected clients receive the event and update their local state — no polling, no stale reads. The Socket.io `sticky sessions` concern doesn't apply here because the entire app runs on one Node process.

---

## Security Model

| Layer | Protection |
|---|---|
| API routes | Session check on every request via `auth()` |
| Workspace data | Membership lookup before any query |
| Owner operations | Role check (`role === "OWNER"`) on top of membership |
| Payment verification | HMAC-SHA256 signature validation before DB update |
| Webhook handlers | Signature verification before processing |
| Passwords | bcrypt with salt rounds |

---

## Deployment

Runs on any Node.js host — Railway, Render, Fly.io, or a plain VPS. Not suitable for Vercel because Socket.io needs a persistent server.

```bash
npm run build
npm start
```

Set all environment variables on your host. Make sure `NEXTAUTH_URL` matches your production domain exactly.

### Razorpay webhooks setup

In the Razorpay dashboard, add a webhook pointing to:
```
https://your-domain.com/api/razorpay/webhook
```

Enable these events: `payment.captured`, `subscription.cancelled`

---

## Scripts

```bash
npm run dev          # Dev server (Next.js + Socket.io)
npm run build        # Production build
npm run start        # Production server
npm run db:push      # Push Prisma schema to database
npm run db:studio    # Open Prisma Studio
npm run lint         # ESLint
```

---

## What's next

Things deliberately left out of scope to keep the build focused:

- Email notifications for task assignments and @mentions
- File attachments on tasks and docs
- Mobile app (the web app is responsive but a native app would be better on mobile)
- Advanced RBAC — custom role definitions per workspace

---

Built with Next.js, PostgreSQL, Socket.io, Google Gemini, and Razorpay.
