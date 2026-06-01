# WorkspaceFlow

WorkspaceFlow is a full-stack real-time workspace for teams. It combines task planning, markdown docs, team chat, member management, analytics, and AI summaries in one product.

Live demo: https://workspace-flow.vercel.app

## Why this project matters

This is not a single-page demo. WorkspaceFlow covers the core parts of a production SaaS app:

- Authentication with email/password and OAuth providers
- Multi-tenant workspaces with roles
- Real-time collaboration with Socket.io
- Drag-and-drop task management
- Markdown documentation
- Team chat and presence
- Analytics dashboards
- AI-assisted summaries and task descriptions
- Database-backed APIs with Prisma and PostgreSQL

For a fresher portfolio, it shows frontend, backend, database design, real-time systems, authentication, AI integration, and deployment awareness in one project.

## Core features

### Workspaces

Create separate workspaces for teams or projects. Each workspace has its own tasks, members, docs, chat, activity, analytics, and integrations.

### Kanban board

Manage tasks across `To Do`, `In Progress`, `Review`, and `Done`. Tasks support priority, labels, due dates, assignees, comments, and drag-and-drop ordering.

### Real-time collaboration

Socket.io powers live presence, chat messages, task movement, task updates, and comment activity. Users can see changes without refreshing the page.

### Docs

Write workspace documents in markdown, preview them, and keep project knowledge next to tasks and team discussions.

### Chat

Each workspace includes a team chat with saved message history, online presence, and typing indicators.

### Members and roles

Invite members by email and manage access with three roles:

- `OWNER`: full workspace control
- `MEMBER`: can collaborate and update work
- `GUEST`: limited access

### Analytics

Track task totals, completion rate, recent activity, priority breakdown, and status distribution with Recharts.

### AI features

Google Gemini powers:

- Workspace summaries
- Standup summaries
- Backlog prioritization
- Task description generation

AI features are optional and only require `GEMINI_API_KEY` when enabled.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | NextAuth v5 / Auth.js |
| Real-time | Socket.io |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| AI | Google Gemini |
| Email | Resend |
| Runtime | Custom Node server with `tsx` |

## Architecture overview

```text
workspace-flow/
├── prisma/
│   └── schema.prisma          Database models and relations
├── server.ts                  Custom Next.js + Socket.io server
├── src/
│   ├── app/
│   │   ├── (auth)/            Login and register pages
│   │   ├── (app)/             Authenticated app routes
│   │   └── api/               REST API routes
│   ├── components/            Reusable UI and product components
│   ├── hooks/                 Client hooks for socket/workspace state
│   ├── lib/                   Auth, Prisma, Gemini, email, utilities
│   ├── store/                 Zustand state
│   └── types/                 Shared TypeScript types
├── MEMORY.md                  Project decisions and session notes
└── ERRORS.md                  Repeated failure notes and fixes
```

## Data model

The main database entities are:

- `User`
- `Workspace`
- `WorkspaceMember`
- `WorkspaceInvite`
- `Task`
- `TaskComment`
- `Doc`
- `Message`
- `Activity`
- `Integration`
- `Subscription`
- `AiSummary`

Every workspace-owned resource is scoped by `workspaceId`, which keeps data separated between teams.

## Getting started

### Requirements

- Node.js 20 or later
- npm
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/thribhuvan003/workspace-flow-.git
cd workspace-flow-
npm install
```

### 2. Create environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/workspaceflow"

# Auth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET=""

# Public app URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth providers, optional
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AI, optional
GEMINI_API_KEY=""

# Email invites, optional
RESEND_API_KEY=""
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

On Windows without OpenSSL, use:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Prepare the database

```bash
npm run db:push
```

### 4. Start development

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the custom Next.js + Socket.io dev server |
| `npm run dev:next` | Start plain Next.js dev server without Socket.io |
| `npm run build` | Generate Prisma client and build the app |
| `npm run start` | Start the production custom server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio |

## Deployment notes

WorkspaceFlow uses a custom Node server for Socket.io. For full real-time behavior, deploy it on a platform that supports long-running Node processes, such as Railway, Render, Fly.io, or a VPS.

Build and start commands:

```bash
npm run build
npm run start
```

Production environment variables should include:

```env
DATABASE_URL=""
AUTH_SECRET=""
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

Optional production variables:

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GEMINI_API_KEY=""
RESEND_API_KEY=""
```

## Quality checks

Before pushing changes:

```bash
npm run lint
npm run build
```

The current production foundation pass has been verified with both commands.

## Portfolio highlights

Good resume bullets for this project:

- Built a full-stack real-time workspace app using Next.js, React, TypeScript, Prisma, PostgreSQL, NextAuth, Socket.io, and Tailwind CSS.
- Implemented kanban task management, team chat, markdown docs, workspace roles, analytics dashboards, and AI-generated summaries.
- Improved production readiness by fixing strict lint issues, aligning real-time event payloads, stabilizing auth configuration, and validating production builds.

## Owner

Built and maintained by:

- GitHub: [thribhuvan003](https://github.com/thribhuvan003)
- Email: `thribhuvan003@gmail.com`

## License

MIT
