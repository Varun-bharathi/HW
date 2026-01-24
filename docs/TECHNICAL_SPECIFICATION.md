# AI-Powered Hiring Platform — Technical Specification

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ Recruiter Dashboard │  │ Job Seeker Dashboard │  │ Shared: Auth, Forum │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                    │                    │
                    ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY / BFF                               │
│                    REST + WebSocket (messaging, real-time)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                    │                    │
        ┌───────────┼───────────┐       │            ┌───────┴───────┐
        ▼           ▼           ▼       ▼            ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │ Jobs & Apps  │ │ AI Service   │ │ Messaging    │ │ Notifications│
│ (JWT, roles) │ │ (CRUD, etc.) │ │ (JD, match,  │ │ (chat, DMs)  │ │ (email, etc.)│
│              │ │              │ │  parsing)    │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │                   │               │               │               │
        └───────────────────┴───────────────┴───────────────┴───────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────┐
                              │     PostgreSQL + Redis      │
                              │  (persistence + cache/ws)   │
                              └─────────────────────────────┘
```

### 1.2 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, Zustand |
| Styling | Tailwind CSS |
| Code Editor | Monaco Editor (assessments) |
| Charts | Recharts |
| Real-time | WebSocket (Socket.io or native) |
| Backend (reference) | Node.js / Express or Next.js API routes |
| Database | PostgreSQL |
| AI | OpenAI / Anthropic APIs (JD gen, parsing, matching); optional embeddings DB |

---

## 2. Database Schema

### 2.1 Core Entities

```sql
-- Users: shared base, role-specific data in recruiter_profile / job_seeker_profile
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  role              VARCHAR(20) NOT NULL CHECK (role IN ('recruiter', 'job_seeker')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recruiter_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name   VARCHAR(255) NOT NULL,
  company     VARCHAR(255),
  avatar_url  VARCHAR(512),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_seeker_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name     VARCHAR(255) NOT NULL,
  resume_url    VARCHAR(512),
  resume_parsed JSONB,                    -- AI-parsed structured data
  skills        TEXT[],
  experience    JSONB,                    -- [{ company, role, years, description }]
  location      VARCHAR(255),
  portfolio_urls TEXT[],
  avatar_url    VARCHAR(512),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  required_skills TEXT[],
  experience_level VARCHAR(50),           -- e.g. 'entry', 'mid', 'senior'
  location        VARCHAR(255),
  employment_type VARCHAR(50),            -- 'full_time', 'part_time', 'contract', etc.
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'closed')),
  cutoff_score    INTEGER,                -- 0–100
  screening_config JSONB,                 -- { duration_minutes, question_ids, etc. }
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Screening tests (preliminary + post-application)
CREATE TABLE assessments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type        VARCHAR(30) NOT NULL CHECK (type IN ('preliminary', 'mcq', 'coding')),
  title       VARCHAR(255),
  config      JSONB,                      -- duration, cutoff, etc.
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('mcq', 'coding')),
  content       TEXT NOT NULL,
  options       JSONB,                    -- MCQ: [{ id, text, correct }]
  solution      TEXT,                     -- coding: reference solution / expected
  max_score     INTEGER DEFAULT 1,
  order_index   INTEGER DEFAULT 0
);

-- Applications and screening attempts
CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status            VARCHAR(30) DEFAULT 'screening' CHECK (status IN (
    'screening', 'passed_screening', 'resume_submitted', 'under_review',
    'shortlisted', 'assessment_sent', 'assessment_completed', 'interview_scheduled',
    'accepted', 'rejected'
  )),
  resume_url        VARCHAR(512),
  resume_parsed     JSONB,
  resume_jd_match   DECIMAL(5,2),         -- 0–100
  screening_score   DECIMAL(5,2),         -- 0–100
  screening_at      TIMESTAMPTZ,
  resume_submitted_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, job_seeker_id)
);

CREATE TABLE screening_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  paused_at       TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  score           DECIMAL(5,2),
  answers         JSONB,                  -- { question_id: selected_option_id | code }
  time_spent_sec  INTEGER
);

CREATE TABLE assessment_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  submitted_at    TIMESTAMPTZ,
  score           DECIMAL(5,2),
  answers         JSONB
);

-- Messaging
CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID REFERENCES jobs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Community
CREATE TABLE forum_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE forum_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  is_announcement BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_replies (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255),
  body       TEXT,
  link       VARCHAR(512),
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Indexes (Essential)

```sql
CREATE INDEX idx_applications_job       ON applications(job_id);
CREATE INDEX idx_applications_seeker    ON applications(job_seeker_id);
CREATE INDEX idx_applications_status    ON applications(status);
CREATE INDEX idx_jobs_recruiter         ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status            ON jobs(status);
CREATE INDEX idx_messages_conversation  ON messages(conversation_id);
CREATE INDEX idx_notifications_user     ON notifications(user_id);
```

---

## 3. API Endpoints

### 3.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/recruiter` | Register recruiter |
| POST | `/api/auth/register/job-seeker` | Register job seeker |
| POST | `/api/auth/login` | Login; body: `{ email, password, role }` |
| POST | `/api/auth/logout` | Logout (invalidate token/session) |
| GET | `/api/auth/me` | Current user + profile by role |

### 3.2 Jobs (Recruiter)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs (recruiter: own; seeker: live only) |
| POST | `/api/jobs` | Create job (recruiter) |
| GET | `/api/jobs/:id` | Job detail |
| PATCH | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| POST | `/api/jobs/:id/publish` | Set status = live |
| POST | `/api/jobs/:id/ai/generate-description` | AI generate JD from title/skills |
| POST | `/api/jobs/:id/ai/generate-questions` | AI generate screening questions (MCQ + coding) |

### 3.3 Applications & Candidates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/:jobId/applications` | List applications (recruiter); sort by match, score |
| GET | `/api/applications` | List own applications (job seeker) |
| GET | `/api/applications/:id` | Application detail + parsed resume, match breakdown |
| POST | `/api/jobs/:id/apply` | Start application (creates application, returns screening) |
| PATCH | `/api/applications/:id/accept` | Accept candidate (recruiter); trigger email |
| PATCH | `/api/applications/:id/reject` | Reject candidate (recruiter); trigger email |
| POST | `/api/applications/:id/send-assessment` | Assign MCQ/coding assessment |

### 3.4 Screening & Assessments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/screening/:applicationId` | Get screening test for application |
| POST | `/api/screening/:applicationId/start` | Start screening; persist started_at |
| POST | `/api/screening/:applicationId/pause` | Pause; save progress, time spent |
| POST | `/api/screening/:applicationId/resume` | Resume screening |
| POST | `/api/screening/:applicationId/submit` | Submit answers; score; update application status |
| GET | `/api/assessments/:id` | Get assessment (MCQ/coding) for job seeker |
| POST | `/api/assessments/:id/start` | Start assessment attempt |
| POST | `/api/assessments/:id/submit` | Submit assessment |

### 3.5 AI & Resume

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/parse-resume` | Upload resume PDF/DOC; return parsed JSON |
| POST | `/api/ai/match-resume` | Body: `{ jobId, resumeParsed }`; return match score + breakdown |

### 3.6 Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations for current user |
| GET | `/api/conversations/:id/messages` | Get messages (paginated) |
| POST | `/api/conversations` | Create or get existing (recruiter–seeker, optional jobId) |
| POST | `/api/conversations/:id/messages` | Send message |
| WS | `/ws/messaging` | Real-time message events |

### 3.7 Community

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forum/categories` | List categories |
| GET | `/api/forum/posts` | List posts (filter by category) |
| POST | `/api/forum/posts` | Create post |
| GET | `/api/forum/posts/:id` | Post + replies |
| POST | `/api/forum/posts/:id/replies` | Add reply |

### 3.8 Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications/:id/read` | Mark read |

### 3.9 Analytics (Recruiter)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/:id/analytics` | Job-level stats: views, applicants, funnel, score trends |
| GET | `/api/recruiter/dashboard` | Aggregated stats across jobs |

---

## 4. Feature Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Project setup: React, Vite, TS, Router, Tailwind, state
- [ ] Auth: register/login (recruiter vs job seeker), JWT, protected routes
- [ ] Role-based layouts and navigation
- [ ] Recruiter + Job Seeker dashboards (shell + placeholder widgets)

### Phase 2 — Jobs & Applications (Weeks 3–4)
- [ ] Job CRUD (create, edit, draft/live)
- [ ] JD input: manual, AI generation, file upload (stub AI)
- [ ] Job listing for seekers: browse, filter, search
- [ ] Application creation flow: “Apply” → screening test entry

### Phase 3 — Screening & Assessments (Weeks 5–6)
- [ ] Preliminary test config: min 10 questions (MCQ + coding), cutoff
- [ ] Screening UI: timer, question nav, pause/resume
- [ ] Code editor for coding questions
- [ ] Scoring and cutoff check; resume upload after pass
- [ ] Post-application assessments (MCQ + coding)

### Phase 4 — AI Integration (Weeks 7–8)
- [ ] Resume parsing (PDF/DOC → structured data)
- [ ] Resume–JD matching and scoring
- [ ] Applicant ranking table: match %, test score, status, actions
- [ ] Candidate accept/reject and email notifications

### Phase 5 — Communication & Community (Weeks 9–10)
- [ ] Real-time messaging (recruiter–seeker)
- [ ] Community forum: categories, posts, replies, announcements
- [ ] Notifications: in-app + email triggers

### Phase 6 — Analytics & Polish (Weeks 11–12)
- [ ] Recruiter analytics: funnel, score trends, job stats
- [ ] Profile pages (recruiter, seeker), settings
- [ ] Interview scheduling (minimal); chat-only interviews (video later)
- [ ] E2E tests, performance, security review

---

## 5. UI/UX Component Map

| Component | Location | Purpose |
|-----------|----------|---------|
| `AuthGuard` | `src/components/auth` | Redirect by role when unauthenticated |
| `RecruiterLayout` / `JobSeekerLayout` | `src/layouts` | Role-specific nav and shell |
| `JobForm` | Recruiter | Create/edit job; JD source: manual / AI / file |
| `ApplicantRankingTable` | Recruiter | Sortable table: name, match %, test score, status, actions |
| `CandidateDetailModal` | Recruiter | Parsed resume, match breakdown, skill gaps |
| `DashboardAnalytics` | Recruiter | Cards, funnel chart, score trends |
| `ProfileEditor` | Both | Editable profile + resume upload (seeker) |
| `JobListing` / `JobCard` | Seeker | Browse, filter, search |
| `ScreeningTest` | Seeker | Timer, questions, pause/resume |
| `CodeEditor` | Shared | Monaco-based editor for coding assessments |
| `AssessmentView` | Seeker | MCQ or coding assessment UI |
| `MessagingInbox` / `ChatThread` | Shared | DMs |
| `ForumView` / `PostDetail` | Shared | Categories, posts, replies |

---

## 6. Security & Compliance

- Passwords hashed with bcrypt (or Argon2).
- JWT with short-lived access token and optional refresh token.
- Role checked on backend for all protected routes.
- File uploads: validate type/size; store in object storage; scan for malware.
- PII (resumes, profiles) encrypted at rest; access logged.
- Rate limiting on auth, AI, and messaging APIs.

---

*This specification supports a production-ready implementation of the AI-powered hiring platform with clear boundaries between Recruiters and Job Seekers, AI-assisted screening, and integrated communication.*
