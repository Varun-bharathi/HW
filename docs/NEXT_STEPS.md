# HireFlow — Next Steps

Actionable roadmap to move from the current React + mock setup to a production-ready full-stack platform.

---

## How to run & set up the database

1. **Server**
   ```bash
   cd server
   cp .env.example .env   # set DATABASE_URL, JWT_SECRET
   npm install
   npx prisma generate
   npx prisma db push     # create tables
   npm run db:seed        # demo users: recruiter@hireflow.demo / seeker@hireflow.demo — password: password123
   npm run dev            # API at http://localhost:4000
   ```

2. **Client**
   ```bash
   cd client
   npm install
   npm run dev            # app at http://localhost:5173, proxies /api → server
   ```

3. **Quick test**: Log in as recruiter or job seeker → Profile → edit and save; changes persist via `GET/PATCH /api/auth/me`.

---

## Immediate next steps (in order)

| Priority | Task | Status |
|----------|------|--------|
| 1 | Profile APIs + React wiring | ✅ Done |
| 2 | **Resume upload** `POST /api/applications/:id/resume` (after screening), parsing stub, wire UI | ✅ Done |
| 3 | **Accept/Reject** `PATCH /api/applications/:id/accept` & `.../reject`, wire JobApplicants | ✅ Done |
| 4 | AI: JD generation, question generation, resume–JD match | ✅ JD + match done |
| 5 | Post-application assessments, chat, forum, analytics | Phases 4–5 |

---

## Phase 1 — Backend & real auth (1–2 weeks)

### 1.1 Backend scaffold

- [x] **Create API server** (Express in `server/`).
- [x] **Add DB** (Prisma + SQLite dev; switch to PostgreSQL via `DATABASE_URL`).
- [x] **Run DB** (`npx prisma db push`); schema in `server/prisma/schema.prisma`.
- [x] **Implement auth endpoints**: `POST /api/auth/register/recruiter`, `register/job-seeker`, `login`, `GET /api/auth/me`.
- [x] **Use bcrypt** + **JWT**.
- [x] **Wire React auth**: `src/api/auth.ts`; auth pages use real API.

### 1.2 Role-specific profiles

- [x] **Recruiter profile**: `GET /api/auth/me`, `PATCH /api/auth/me` (full_name, company).
- [x] **Job seeker profile**: same endpoints; job seeker fields: full_name, skills, experience, location, portfolio_urls.
- [x] **Update React**: RecruiterProfile and JobSeekerProfile fetch `/me`, PATCH on save via `api/me.ts`.
- [ ] **Resume upload**: multipart → storage (S3/local); wire to job seeker profile or application flow.

---

## Phase 2 — Jobs & applications (2–3 weeks)

### 2.1 Jobs CRUD

- [x] **Endpoints**: `GET/POST /api/jobs`, `GET/PATCH/DELETE /api/jobs/:id`, `POST /api/jobs/:id/publish`.
- [x] **Job fields**: title, description, required_skills, experience_level, location, employment_type, status, cutoff_score.
- [x] **React**: JobPostingCreate, RecruiterDashboard, JobDiscovery use `jobsApi`; Job Detail uses `jobsApi.get`, Apply → `jobsApi.apply`.

### 2.2 Applications & screening

- [x] **Endpoints**: `POST /api/jobs/:id/apply`, `GET /api/jobs/:jobId/applications`, `GET /api/applications`, `GET/POST /api/screening/:applicationId` (start, pause, resume, submit).
- [x] **Store** screening answers, score (MCQ), cutoff, application status.
- [x] **React**: Apply → redirect to `/assessment/screening/:applicationId`; ScreeningTest uses `screeningApi`; My Applications, Job Applicants use real API.

### 2.3 Resume upload & parsing stub

- [x] **`POST /api/applications/:id/resume`**: upload PDF/DOC (multer), store in `server/uploads/`, save `resume_url`. Serve via `express.static`.
- [x] **Stub resume parsing**: mock JSON in `application.resume_parsed`; replace with pdf-parse + LLM later.
- [x] **React**: My Applications "Upload resume" for `passed_screening`; status → `resume_submitted` after upload.

---

## Phase 3 — AI (2–3 weeks)

### 3.1 Job description & questions

- [x] **`POST /api/ai/generate-description`**: use OpenAI/Anthropic with title + skills → return JD. React “Auto-generate” calls this.
- [x] **`POST /api/jobs/:id/ai/generate-questions`**: generate min 10 (MCQ + coding). Store in `questions` linked to job’s preliminary assessment.
- [ ] **Optional**: PDF/DOC JD upload → extract text → same generate flow or use as context.

### 3.2 Resume–JD matching

- [x] **Stub resume parsing** on upload; store `resume_parsed`. Replace with pdf-parse + LLM later.
- [x] **On resume submit**: keyword-based match → save `resume_jd_match`.
- [x] **React**: Candidate modal shows `resume_parsed`, `resume_jd_match`, skill gaps vs JD.

### 3.3 Ranking & actions

- [x] **Sort** `GET /api/jobs/:jobId/applications` by `resume_jd_match`, then `screening_score`.
- [x] **`PATCH /api/applications/:id/accept`** and **`.../reject`** → update status (email in Phase 5).
- [x] **React**: JobApplicants Accept/Reject wired to API; buttons hidden for accepted/rejected.

---

## Phase 4 — Assessments & interviews (1–2 weeks)

### 4.1 Post-application assessments

- [ ] **`POST /api/applications/:id/send-assessment`**: assign MCQ or coding assessment.
- [ ] **`GET /api/assessments/:id`**, **`POST .../start`**, **`.../submit`** for job seeker.
- [ ] **React**: AssessmentView fetches by `assessmentId`; persist answers, compute score.

### 4.2 Chat (interview)

- [ ] **Conversations**: `GET/POST /api/conversations`, `GET/POST /api/conversations/:id/messages`.
- [ ] **WebSocket** (e.g. Socket.io): `/ws/messaging` for real-time messages.
- [ ] **React**: MessagingInbox uses REST + WebSocket; optional `jobId` when conversation is job-specific.

### 4.3 Video (later)

- [ ] Defer or use a third-party (e.g. Daily.co, Twilio) when required.

---

## Phase 5 — Notifications, forum, analytics (1–2 weeks)

### 5.1 Notifications

- [ ] **`GET /api/notifications`**, **`PATCH /api/notifications/:id/read`**.
- [ ] **Email**: transactional emails (e.g. SendGrid, Resend) for:
  - Test invite, assessment invite, interview scheduled, accept/reject.
- [ ] **React**: Notification dropdown or page; mark-as-read.

### 5.2 Community forum

- [ ] **Endpoints**: `GET/POST /api/forum/categories`, `GET/POST /api/forum/posts`, `GET /api/forum/posts/:id`, `POST .../replies`.
- [ ] **React**: ForumView fetches categories and posts; add post detail + reply UI.

### 5.3 Analytics

- [ ] **`GET /api/jobs/:id/analytics`**: funnel, score trends, etc.
- [ ] **`GET /api/recruiter/dashboard`**: aggregated stats.
- [ ] **React**: Recruiter dashboard uses these instead of mock data.

---

## Phase 6 — Polish & deploy

- [ ] **E2E tests** (e.g. Playwright): auth, apply flow, screening, ranking.
- [ ] **Security**: rate limiting, CORS, env-based secrets, PII handling.
- [ ] **Deploy**: frontend (Vercel/Netlify), API (Railway/Render/Fly.io), PostgreSQL (managed DB), Redis if used for WS/cache.

---

## Quick reference

| Deliverable | Spec section | React touchpoints |
|-------------|--------------|-------------------|
| Auth | §3.1 | `mockAuth`, `AuthGuard`, auth pages |
| Jobs | §3.2 | JobPostingCreate, JobPostingEdit, Job Discovery, dashboard |
| Applications & screening | §3.3, §3.4 | JobDetail (Apply), ScreeningTest, My Applications |
| AI (JD, questions, match) | §3.5 | JobPostingCreate, JobApplicants, CandidateDetailModal |
| Assessments | §3.4 | AssessmentView |
| Messaging | §3.6 | MessagingInbox |
| Forum | §3.7 | ForumView |
| Notifications | §3.8 | (to add) |
| Analytics | §3.9 | RecruiterDashboard |

---

## Suggested order to implement

1. **Backend + DB + auth** → swap mock auth in React.
2. **Jobs CRUD** → real job list and create/edit.
3. **Apply + screening** → full apply flow and screening test with real API.
4. **Resume upload + match** → parsing stub, then AI match; ranking table.
5. **AI JD & questions** → auto-generate in UI.
6. **Accept/Reject + email** → complete recruiter workflow.
7. **Assessments, messaging, forum, analytics** → per priority.

Use `docs/TECHNICAL_SPECIFICATION.md` for exact payloads and wire the existing `src/api/client.ts` (and eventually TanStack Query) for all API calls.
