# HireFlow — AI-Powered Hiring Platform

Full-stack hiring platform for **Recruiters** (job posting, AI screening, candidate ranking) and **Job Seekers** (profile, job discovery, assessments).

## Stack

- **Client:** React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, Recharts, Monaco Editor
- **Server:** Express, TypeScript, Prisma, SQLite (dev) / PostgreSQL (prod)
- **Auth:** JWT, bcrypt; role-based (recruiter / job_seeker)

## Quick start

### 1. API (server)

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Runs at **http://localhost:4000**. Seed users:

- **Recruiter:** `recruiter@hireflow.demo` / `password123`
- **Job seeker:** `seeker@hireflow.demo` / `password123`

### 2. Client (React)

```bash
cd client
npm install
npm run dev
```

Runs at **http://localhost:3000**. The app proxies `/api` to the server.

### 3. Run both

From repo root:

```bash
cd server && npm run dev
```

In another terminal:

```bash
cd client && npm run dev
```

Then open **http://localhost:3000**, sign up or use the seed users, and use the platform.

## Project layout

```
cap-stone/
├── client/          # React SPA
├── server/          # Express API + Prisma
├── docs/
│   ├── TECHNICAL_SPECIFICATION.md
│   └── NEXT_STEPS.md
└── README.md
```

## Features

- **Auth:** Separate recruiter / job seeker register & login; JWT.
- **Jobs:** Create (draft), edit, publish; AI JD generation (stub); preliminary screening config.
- **Applications:** Apply → preliminary test → resume upload (stub); ranking table; accept/reject.
- **Screening:** GET config, start/pause/resume/submit; MCQ + coding; cutoff scoring.
- **Dashboards:** Recruiter (analytics, funnel, jobs); Job seeker (applications, suggested jobs).
- **Forum & messaging:** UI placeholders; API to be wired.

## Docs

- [Technical spec](docs/TECHNICAL_SPECIFICATION.md) — architecture, DB schema, API, roadmap
- [Next steps](docs/NEXT_STEPS.md) — phased implementation checklist

## Env

**Server** (`server/.env`):

- `DATABASE_URL` — e.g. `file:./dev.db` (SQLite) or Postgres URL
- `JWT_SECRET` — signing secret
- `PORT` — default 4000

**Client:** Vite proxy targets `http://localhost:4000` for `/api`.
