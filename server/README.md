# HireEngine API

Express + Prisma + SQLite backend for the hiring platform.

## Setup

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

## Run

```bash
npm run dev
```

API runs at **http://localhost:4000**. The React app (port 3000) proxies `/api` here.

## Env

| Var | Description |
|-----|-------------|
| `DATABASE_URL` | Prisma DB URL. Default `file:./dev.db` (SQLite in `prisma/`) |
| `JWT_SECRET` | Secret for JWT signing. Change in production. |
| `PORT` | Server port (default 4000) |

## Seed users

- **Recruiter:** `recruiter@HireEngine.demo` / `password123`
- **Job seeker:** `seeker@HireEngine.demo` / `password123`

## Endpoints

- `POST /api/auth/register/recruiter` — body: `{ email, password, full_name, company? }`
- `POST /api/auth/register/job-seeker` — body: `{ email, password, full_name }`
- `POST /api/auth/login` — body: `{ email, password, role }`
- `GET /api/auth/me` — Bearer token
- `GET/POST /api/jobs` — list (role-based) / create (recruiter)
- `GET /api/jobs/:id` — job detail
- `GET /api/jobs/:id/applications` — applicants (recruiter)
- `POST /api/jobs/:id/apply` — apply (seeker)
- `PATCH /api/jobs/:id` — update (recruiter)
- `POST /api/jobs/:id/publish` — set status live
- `GET /api/applications` — my applications (seeker)
- `GET /api/applications/:id` — application detail
- `GET /api/screening/:applicationId` — screening config
- `POST /api/screening/:applicationId/start` — start
- `POST /api/screening/:applicationId/pause` — body: `{ answers?, time_spent_sec? }`
- `POST /api/screening/:applicationId/resume` — resume
- `POST /api/screening/:applicationId/submit` — body: `{ answers, time_spent_sec? }`
