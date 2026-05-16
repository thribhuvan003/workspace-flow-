# WorkspaceFlow

> A modern, real-time project management tool built for teams who want everything in one place — tasks, docs, chat, and AI insights.

**[→ Live Demo](https://workspace-flow.vercel.app)**

---

## What is it?

WorkspaceFlow is a full-stack team workspace app. Think of it like a lighter version of Notion + Linear combined — you get a kanban board, collaborative docs, live team chat, analytics, and AI-powered summaries, all under one roof.

---

## What can you use it for?

- Managing tasks and sprints with a drag-and-drop kanban board
- Writing and sharing docs with your team in real time
- Chatting with teammates without leaving your workspace
- Getting AI-generated standups, project summaries, and backlog priorities
- Tracking team progress with 30-day velocity charts
- Inviting teammates and assigning roles (Owner, Member, Guest)

---

## Features at a glance

| | |
|---|---|
| 🗂 **Kanban Board** | Drag and drop tasks across columns, live-synced for everyone |
| 📝 **Docs** | Write markdown docs, preview them instantly |
| 💬 **Team Chat** | Real-time messaging inside every workspace |
| 🤖 **AI Summaries** | Generate standups, project overviews, and backlog plans with one click |
| ✨ **Task AI** | Write a task title — AI fills in the full description |
| 📊 **Analytics** | Visual charts for task completion, velocity, and priority breakdown |
| 👥 **Members** | Invite by email, manage roles, see who's online |
| 🔌 **Integrations** | Connect Slack, GitHub, and Discord |
| ⌨️ **Command Palette** | Hit `Cmd+K` to jump anywhere instantly |
| 🌗 **Light & Dark mode** | Fully themed, toggle anytime |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth v5 — Google, GitHub, email/password |
| Real-time | Socket.io |
| Styling | Tailwind CSS v4 + Framer Motion |
| AI | Google Gemini |
| Email | Resend |
| Charts | Recharts |

---

## Running it locally

**You'll need:** Node.js 20+ and a PostgreSQL database.

### 1. Clone the repo

```bash
git clone https://github.com/thribhuvan003/workspace-flow-.git
cd workspace-flow-
npm install
```

### 2. Create a `.env` file

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/workspaceflow"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""                  # run: openssl rand -base64 32

# OAuth (optional — skip if you only want email/password login)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AI (optional — needed for AI summaries and task descriptions)
GEMINI_API_KEY=""

# Email (optional — needed for invite emails)
RESEND_API_KEY=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database and start

```bash
npm run db:push   # creates all tables
npm run dev       # starts at http://localhost:3000
```

That's it — open [localhost:3000](http://localhost:3000) and create your first workspace.

---

## Deploying

Deploy to **Railway**, **Render**, or **Fly.io** (any platform that supports persistent Node.js processes).

```bash
npm run build
npm start
```

Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain, and run `npx prisma migrate deploy` on your first deploy.

---

## Project structure

```
workspace-flow/
├── prisma/
│   └── schema.prisma         # all database models
├── src/
│   ├── app/
│   │   ├── (auth)/           # login & register pages
│   │   ├── (app)/
│   │   │   ├── dashboard/    # workspace switcher / home
│   │   │   └── workspace/    # kanban, docs, chat, members, analytics
│   │   └── api/              # all REST API routes
│   ├── components/           # reusable UI components
│   ├── hooks/                # custom React hooks
│   ├── lib/                  # auth, db, email, AI helpers
│   └── types/                # shared TypeScript types
```

---

## Scripts

```bash
npm run dev          # start dev server
npm run build        # production build
npm run start        # start production server
npm run db:push      # sync schema to database
npm run db:studio    # open Prisma Studio (visual DB editor)
npm run lint         # run ESLint
```

---

## License

MIT — free to use, modify, and deploy.
