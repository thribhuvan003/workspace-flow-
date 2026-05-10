# WorkspaceFlow

Real-time project management for teams. Kanban boards, collaborative docs, AI insights, team management — one dark-mode workspace, one Node process.

Built with Next.js 16, TypeScript, Socket.io, PostgreSQL, and Google Gemini.

---

## Features

- **Kanban board** — drag-and-drop with live sync across all connected teammates simultaneously
- **Collaborative docs** — real-time character-by-character updates as you type
- **Task comments** — live typing indicators show who's composing before they hit send
- **Team management** — invite by email, assign roles (Owner / Member / Guest), remove members
- **Third-party integrations** — Slack, GitHub, Discord for piping activity into existing tools
- **AI workspace insights** — Gemini summarises your workspace, generates standups, or prioritises your backlog
- **AI task descriptions** — one click writes a professional description from just a title
- **Cmd+K command palette** — keyboard-first navigation to anywhere in the app
- **Analytics dashboard** — area charts, pie charts, 30-day velocity, completion rates
- **Multi-workspace support** — one account, isolated workspaces, clean RBAC

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | RSCs cut client JS; middleware runs at the edge |
| Language | TypeScript strict | Catches whole categories of bugs at compile time |
| Database | PostgreSQL + Prisma v7 | Type-safe queries; schema-as-code prevents drift |
| Auth | NextAuth v5 | Supports Google, GitHub, and email/password |
| Real-time | Socket.io v4 | Rooms, reconnect logic, and reliable fallback transport |
| AI | Google Gemini (Pro + Flash) | Pro for deep summaries, Flash for sub-1s task descriptions |
| Styling | Tailwind CSS v4 | Zero-runtime; new `@theme` API drops the config file |
| Animations | Framer Motion | Declarative spring physics and layout animations |
| Drag & Drop | @hello-pangea/dnd | Accessible fork of react-beautiful-dnd |
| Charts | Recharts | Composable D3-backed chart primitives |

---

## Architecture

### Custom Node server

Next.js App Router doesn't support persistent WebSocket connections — serverless functions die after each request. `server.ts` wraps Next's request handler with a plain Node HTTP server and attaches Socket.io on the same port. One process handles both HTTP and WebSocket traffic, no extra infrastructure.

### Real-time sync

When a client opens a workspace it joins a Socket.io room keyed by `workspaceId`. Every mutation emits an event to that room server-side. All connected clients update within milliseconds, no polling.

```
task-moved · task-created · task-deleted · comment-added · doc-updated · typing-start · typing-stop
```

### Prisma v7 connection

```typescript
// src/lib/prisma.ts
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

Prisma v7 uses driver adapters instead of the `url` datasource field. This gives direct access to the underlying `pg` pool when needed.

### Multi-tenancy

Every API route checks workspace membership before touching data:

```typescript
const access = await prisma.workspaceMember.findUnique({
  where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
});
if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

Owner-only operations add a role check on top. No cross-tenant leaks by design — every query is scoped to a `workspaceId`.

### AI

Two Gemini models for different latency requirements:

- `gemini-1.5-pro` — workspace summaries, standups, backlog prioritisation. Higher quality, results persisted to DB.
- `gemini-1.5-flash` — task description generation from a title + priority. Under 1s in practice.

---

## Project Structure

```
workspace-flow/
├── prisma/
│   └── schema.prisma              # 12 models
├── server.ts                      # Node server — Next.js + Socket.io on one port
├── src/
│   ├── app/
│   │   ├── (auth)/                # Login + register
│   │   ├── (app)/
│   │   │   ├── dashboard/         # Workspace list + create flow
│   │   │   └── workspace/[slug]/
│   │   │       ├── page.tsx       # Kanban board
│   │   │       ├── docs/          # Real-time doc editor
│   │   │       ├── members/       # Team management
│   │   │       ├── analytics/     # Charts + AI insights
│   │   │       ├── integrations/  # Slack · GitHub · Discord
│   │   │       └── settings/      # Workspace config
│   │   └── api/
│   │       ├── auth/              # NextAuth + email register
│   │       ├── workspaces/[id]/   # Tasks · Docs · Members · Invite · AI
│   │       └── tasks/[id]/        # Task PATCH + comments
│   ├── components/
│   │   ├── ui/                    # Button, Input, Dialog, Badge …
│   │   ├── layout/workspace-sidebar.tsx
│   │   ├── tasks/task-detail-modal.tsx
│   │   └── command-palette.tsx
│   ├── hooks/use-socket.ts
│   └── lib/
│       ├── auth.ts
│       ├── prisma.ts
│       ├── gemini.ts
│       └── utils.ts
```

---

## Local Setup

**Prerequisites:** Node.js 20+, PostgreSQL 15+

```bash
git clone https://github.com/thribhuvan003/workspace-flow.git
cd workspace-flow
npm install
```

Copy `.env.example` to `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/workspaceflow"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""              # openssl rand -base64 32

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

GEMINI_API_KEY=""               # aistudio.google.com

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

```bash
npm run db:push     # push schema + generate Prisma client
npm run dev         # Next.js + Socket.io on localhost:3000
```

---

## Deployment

Any Node.js host works — Railway, Render, Fly.io, or a plain VPS. Vercel won't work because Socket.io needs a persistent process.

```bash
npm run build
npm start
```

Set `NEXTAUTH_URL` to your production domain exactly. Run `npx prisma migrate deploy` on first deploy.

---

## Security

| Layer | Protection |
|---|---|
| API routes | Session check on every request |
| Workspace data | Membership lookup before any query |
| Owner actions | Additional role check |
| Passwords | bcrypt |

---

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Production server
npm run db:push      # Push schema to database
npm run db:studio    # Prisma Studio
npm run lint         # ESLint
```

---

## Roadmap

- Email notifications for task assignments and @mentions
- File attachments on tasks and docs
- Native mobile app
- Custom role definitions per workspace
