# WorkspaceFlow

Real-time project management for teams. Kanban boards, live docs, smart insights, and team management — all in one dark-mode workspace.

**[Live Demo](https://workspace-flow-git-main-thribhuvans-projects-d5694d22.vercel.app)**

---

## What it does

| Feature | Description |
|---|---|
| Kanban Board | Drag-and-drop tasks with live sync across all teammates |
| Collaborative Docs | Real-time editing with character-by-character updates |
| Smart Insights | Auto-generated workspace summaries, standups, and backlog priorities |
| Task AI | One click writes a full task description from just a title |
| Team Management | Invite by email, assign roles (Owner / Member / Guest) |
| Integrations | Connect Slack, GitHub, and Discord |
| Analytics | 30-day velocity, completion rates, and visual charts |
| Command Palette | `Cmd+K` to navigate anywhere instantly |
| Multi-workspace | One account, multiple isolated workspaces |

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Database** — PostgreSQL + Prisma
- **Auth** — NextAuth v5 (Google, GitHub, email/password)
- **Real-time** — Socket.io
- **Styling** — Tailwind CSS v4 + Framer Motion
- **Charts** — Recharts

---

## Getting Started

**Requirements:** Node.js 20+, PostgreSQL 15+

### 1. Clone and install

```bash
git clone https://github.com/thribhuvan003/workspace-flow-.git
cd workspace-flow-
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/workspaceflow"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

GEMINI_API_KEY=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

### 3. Run

```bash
npm run db:push   # set up the database
npm run dev       # start on localhost:3000
```

---

## Deployment

Deploy to any Node.js host — **Railway**, **Render**, or **Fly.io**.

> Vercel won't work because Socket.io requires a persistent process.

```bash
npm run build
npm start
```

Set `NEXTAUTH_URL` to your production domain. Run `npx prisma migrate deploy` on first deploy.

---

## Project Structure

```
workspace-flow/
├── prisma/schema.prisma          # database schema
├── server.ts                     # custom Node server (Next.js + Socket.io)
└── src/
    ├── app/
    │   ├── (auth)/               # login + register
    │   ├── (app)/
    │   │   ├── dashboard/        # workspace list
    │   │   └── workspace/[slug]/ # kanban, docs, members, analytics
    │   └── api/                  # all API routes
    ├── components/               # reusable UI components
    └── lib/                      # auth, database, utilities
```

---

## Available Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # production server
npm run db:push      # sync database schema
npm run db:studio    # open Prisma Studio
npm run lint         # run ESLint
```

---

## License

MIT
