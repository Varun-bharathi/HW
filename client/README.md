# HireFlow — React Client

AI-powered hiring platform frontend: Recruiter and Job Seeker dashboards, job posting, applicant ranking, screening tests, and more.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **React Router** — role-based routes
- **Zustand** — auth state
- **TanStack Query** — (ready for API integration)
- **Tailwind CSS** — styling
- **Recharts** — recruiter analytics
- **Monaco Editor** — coding assessments
- **Lucide React** — icons

## Setup

```bash
cd client
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command    | Description                |
|-----------|----------------------------|
| `npm run dev`    | Start dev server          |
| `npm run build`  | Type-check + production build |
| `npm run preview`| Preview production build  |
| `npm run lint`   | Run ESLint                |

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/auth/recruiter/login`, `/auth/recruiter/register` | Recruiter auth |
| `/auth/job-seeker/login`, `/auth/job-seeker/register` | Job seeker auth |
| `/recruiter/dashboard` | Recruiter dashboard |
| `/recruiter/jobs/new` | Create job |
| `/recruiter/jobs/:id/edit` | Edit job |
| `/recruiter/jobs/:id/applicants` | Applicant ranking table |
| `/recruiter/profile` | Recruiter profile |
| `/seeker/dashboard` | Job seeker dashboard |
| `/seeker/jobs` | Job discovery |
| `/seeker/jobs/:id` | Job detail · Apply |
| `/seeker/applications` | My applications |
| `/seeker/profile` | Job seeker profile |
| `/assessment/screening/:applicationId` | Preliminary test (timer, pause/resume, code editor) |
| `/assessment/:assessmentId` | MCQ / coding assessment |
| `/messages` | Messaging (auth required) |
| `/forum` | Community forum |

## Mock Auth

Login/register use mock API (`src/api/mockAuth.ts`). Any email/password works. Replace with real auth when wiring to backend.

## Backend

See `docs/TECHNICAL_SPECIFICATION.md` for API design, DB schema, and roadmap. Configure `vite.config.ts` proxy to point at your API.
