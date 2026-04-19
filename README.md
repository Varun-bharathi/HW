# HireEngine — AI-Powered Hiring Platform

Full-stack hiring platform for **Recruiters** (job posting, AI screening, candidate ranking) and **Job Seekers** (profile, job discovery, assessments, and live HR interviews).

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Client** | React 18, TypeScript, Vite, React Router v6, TanStack Query, Zustand, Tailwind CSS, Recharts, Monaco Editor |
| **Server** | Express, TypeScript, Prisma ORM, SQLite (dev) / PostgreSQL (prod) |
| **Auth** | JWT, bcrypt — role-based (`recruiter` / `job_seeker`) |
| **AI / Parsing** | Python microservice (`python_service/resume_parser_api.py`) for resume parsing & JD match scoring |
| **Code Execution** | [Piston API](https://emkc.org/api/v2/piston) for sandboxed multi-language code running |
| **Proctoring** | Webcam capture + tab-switch detection during assessments |

---

## Quick Start

### 1. Server (Express API)

```bash
cd server
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET
npm install
npx prisma generate
npx prisma db push
npm run db:seed             # creates demo recruiter + job seeker
npm run dev                 # http://localhost:4000
```

**Seed credentials:**

| Role | Email | Password |
|------|-------|----------|
| Recruiter | `recruiter@HireEngine.demo` | `password123` |
| Job Seeker | `seeker@HireEngine.demo` | `password123` |

### 2. Client (React SPA)

```bash
cd client
npm install
npm run dev                 # http://localhost:3000
```

Vite proxies all `/api` requests to `http://localhost:4000`.

### 3. Python Resume Parser (optional)

```bash
cd server/python_service
pip install -r requirements.txt
python resume_parser_api.py  # http://localhost:5001
```

If not running, resume upload still works but match score defaults to `0`.

---

## Project Layout

```
Hiring-Web-Application/
├── client/                    # React SPA
│   └── src/
│       ├── api/               # API client functions
│       ├── components/        # Shared UI components
│       ├── hooks/             # Custom hooks (proctoring, etc.)
│       ├── pages/
│       │   ├── assessment/    # ScreeningTest, AptitudeTest, CodingTest
│       │   ├── interview/     # InterviewLobby, InterviewRoom
│       │   ├── recruiter/     # Dashboard, JobApplicants, etc.
│       │   └── seeker/        # Dashboard, MyApplications, etc.
│       └── stores/            # Zustand auth store
├── server/
│   ├── prisma/                # schema.prisma + migrations
│   ├── python_service/        # Resume parser API (Flask)
│   ├── src/
│   │   ├── lib/               # Question banks (screening, aptitude, coding)
│   │   ├── middleware/        # Auth middleware
│   │   └── routes/            # applications, auth, jobs, screening, ai
│   └── uploads/               # Uploaded resumes + proctoring images
└── README.md
```

---

## Full Candidate Journey

```
Apply for job
    │
    ▼
Preliminary Screening Test  (MCQ + coding, timed, proctored)
    │
    ▼
Recruiter: Pass / Reject screening
    │  pass
    ▼
Resume Upload  (PDF/DOCX — parsed by AI, JD match scored)
    │
    ▼
Recruiter: Shortlist → Send Aptitude Test
    │
    ▼
Aptitude Test  (Verbal, Quantitative, Logical Reasoning — 60 min)
    │
    ▼
Recruiter: Pass → Send Coding Assessment
    │
    ▼
Coding Assessment  (2 LeetCode-style questions, multi-language, run & test)
    │
    ▼
Recruiter: Pass → Send HR Interview
    │
    ▼
HR Interview Lobby  ← Seeker waits here (polls every 2 s)
    │  Recruiter clicks "Admit"
    ▼
Live Interview Room  (webcam, mic, in-session chat, end-call)
    │
    ▼
Accept / Reject
```

---

## Feature Summary

### Recruiter
- **Dashboard** — live job count, applicant funnel chart, 7-day score trend
- **Job Management** — create (draft), AI-generate JD by title, edit, publish, delete
- **Applicants Table** — sortable by name / resume match / test scores / status; accept/reject at each stage
- **Send Assessments** — aptitude test, coding assessment, HR interview invitation
- **HR Interview** — admit waiting candidates into a live video room; pulsing indicator when candidate is in lobby

### Job Seeker
- **My Applications** — track status through every pipeline stage
- **Upload Resume** — dashed upload button appears after passing screening; AI scores resume vs JD
- **Aptitude Test** — 10-question timed MCQ (Verbal + Quantitative + Logical)
- **Coding Test** — Monaco editor, multi-language (JS, Python, Java, C++, C#, C), instant test-case runner
- **Join HR Interview** — "Join HR Interview" button appears when interview is scheduled; lobby waits for recruiter admission
- **Interview Room** — local webcam preview, mic/cam toggle, in-session chat, call timer, end call

### Platform
- **Proctoring** — webcam snapshots + tab-switch violation detection during all assessments
- **AI JD Generation** — context-aware job descriptions generated from job title via `/api/ai/generate-jd`
- **Resume Parsing** — Python service extracts text and computes cosine-similarity match score vs JD

---

## Application Status Flow

| Status | Meaning |
|--------|---------|
| `screening` | Applied, not yet tested |
| `screening_submitted` | Screening test submitted |
| `passed_screening` | Recruiter approved — resume upload unlocked |
| `resume_submitted` | Resume uploaded & parsed |
| `shortlisted` | Recruiter shortlisted |
| `assessment_sent` | Aptitude test sent |
| `assessment_completed` | Aptitude test submitted |
| `passed_aptitude` | Recruiter approved aptitude |
| `coding_sent` | Coding assessment sent |
| `coding_completed` | Coding submitted |
| `passed_coding` | Recruiter approved coding |
| `interview_scheduled` | HR interview invitation sent |
| `accepted` | Offer accepted |
| `rejected` | Rejected at any stage |

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register (recruiter or job_seeker) |
| `POST` | `/api/auth/login` | Login → JWT |
| `GET` | `/api/jobs` | List live jobs (public) |
| `POST` | `/api/jobs` | Create job (recruiter) |
| `PATCH` | `/api/jobs/:id/publish` | Publish draft job |
| `GET` | `/api/applications` | List my applications (seeker) |
| `POST` | `/api/applications/:id/resume` | Upload resume |
| `POST` | `/api/applications/:id/screening/start` | Start screening test |
| `POST` | `/api/applications/:id/screening/run-code` | Run code (Piston) |
| `POST` | `/api/applications/:id/assessment/start` | Start aptitude test |
| `POST` | `/api/applications/:id/coding-assessment/start` | Start coding assessment |
| `PATCH` | `/api/applications/:id/interview/admit` | Recruiter admits candidate |
| `POST` | `/api/applications/:id/interview/join` | Seeker joins lobby |
| `GET` | `/api/applications/:id/interview/status` | Poll lobby state |
| `PATCH` | `/api/applications/:id/interview/end` | End interview session |
| `POST` | `/api/ai/generate-jd` | Generate job description (AI) |

---

## Environment Variables

**`server/.env`**

```env
DATABASE_URL="file:./dev.db"   # SQLite for dev; use postgres://... for prod
JWT_SECRET="your-secret-here"
PORT=4000
```

**Client:** Vite proxy targets `http://localhost:4000` for all `/api` requests — no client env needed.

---

## Notes

- **Interview video** — the room shows your local camera preview. Full peer-to-peer video (seeker ↔ recruiter) requires a WebRTC signaling server (Socket.io + STUN/TURN). The lobby → admit flow is fully functional.
- **SQLite** is used for local dev. For production, update `DATABASE_URL` to a Postgres connection string and run `npx prisma migrate deploy`.
- **Uploaded files** are stored under `server/uploads/`. In production, replace with S3 or equivalent object storage.
            