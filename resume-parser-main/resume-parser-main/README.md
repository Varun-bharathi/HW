# Resume Parser - User Guide

A Node.js-based resume parsing and candidate matching service that uses AI embeddings and semantic matching to rank candidates against job descriptions.

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- Hugging Face API token
- Supabase account with database

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```
   HF_TOKEN=your_huggingface_api_token
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_api_key
   PORT=3001
   ```

3. **Start the server:**
   ```bash
   npm start          # Production mode
   npm run dev        # Development mode with auto-reload
   ```

   The server will start at `http://localhost:3001`

---

## 🚀 How to Use

### 1. **Upload a Job Description**

Create a job posting to establish matching criteria.

**Endpoint:** `POST /api/upload-desc`

**Request body:**
```json
{
  "role": "Senior Backend Developer",
  "description": "We are hiring a backend developer with experience in Node.js, databases, and API design",
  "experience": "5+ years of backend development experience required"
}
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Save the `job_id` - you'll need it to match resumes.

---

### 2. **Ingest a Resume**

Upload and process a resume PDF for a candidate.

**Endpoint:** `POST /api/ingest-resume`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- File parameter: `file` (PDF only)
- Form data:
  ```
  file: <resume.pdf>
  candidate_id: 12345
  candidate_name: John Doe
  job_id: 550e8400-e29b-41d4-a716-446655440000
  ```

**Response:**
```json
{
  "message": "Resume processed",
  "score": 0.87
}
```

The system parses the PDF, chunks the text, generates embeddings, and calculates a match score against the job description (0-1 scale).

---

### 3. **Get Ranked Candidate List**

Retrieve all candidates who applied for a job, ranked by match score.

**Endpoint:** `POST /api/candidate-list`

**Request body:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
[
  {
    "candidate_id": 12345,
    "candidate_name": "John Doe",
    "score": 0.87
  },
  {
    "candidate_id": 12346,
    "candidate_name": "Jane Smith",
    "score": 0.82
  }
]
```

Candidates are sorted by score in descending order (best matches first).

---

### 4. **Get All Job IDs**

List all active job postings in the system.

**Endpoint:** `GET /api/get-jobids`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "Senior Backend Developer"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "role": "Full Stack Engineer"
  }
]
```

---

## 📋 Workflow Example

```
1. Upload job description
   POST /api/upload-desc
   ↓
2. Receive job_id
   ↓
3. Upload candidate resumes
   POST /api/ingest-resume (repeat for each candidate)
   ↓
4. Get ranked candidates
   POST /api/candidate-list
   ↓
5. Review top matches
```

---

## 🔧 Configuration

Edit `config.js` to customize:

- **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2`
- **LLM Model:** `meta-llama/Llama-3.2-3B-Instruct`
- **Chunk Size:** 1500 characters (with 200 overlap)
- **Temperature:** 0.1 (lower = more deterministic)
- **Port:** 3001 (or set `PORT` env var)

---

## ⚡ Quick Test

Use cURL or Postman to test the API:

```bash
# 1. Upload job
curl -X POST http://localhost:3001/api/upload-desc \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Frontend Developer",
    "description": "React and Vue.js expert needed",
    "experience": "3+ years"
  }'

# 2. Get all jobs
curl http://localhost:3001/api/get-jobids

# 3. Get candidates for a job
curl -X POST http://localhost:3001/api/candidate-list \
  -H "Content-Type: application/json" \
  -d '{"job_id": "your_job_id_here"}'
```

---

## 🗄️ Supabase Database Setup

### Create Tables and Enable Vector Extension

Log into your Supabase dashboard, navigate to the **SQL Editor**, and run the following SQL commands:

```sql
-- 1. Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Table for Job Descriptions
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT,
  description TEXT,
  experience TEXT,
  embedding vector(384) -- Now this will work!
);

-- 3. Table for Candidate Resumes
CREATE TABLE IF NOT EXISTS resumes (
  candidate_id TEXT PRIMARY KEY,
  candidate_name TEXT,
  job_id uuid REFERENCES jobs(id),
  resume_text TEXT,
  embedding vector(384),
  score FLOAT
);
```

### What Each Table Does

- **jobs**: Stores job postings and their semantic embeddings for matching
- **resumes**: Stores candidate resumes, embeddings, and match scores against jobs
- **vector(384)**: Uses pgvector extension to store AI embeddings (384 dimensions from the embedding model)

### Enable RLS (Optional but Recommended)

For production, enable Row Level Security in the Supabase dashboard:
1. Go to **Authentication** → **Policies**
2. Create policies to restrict data access as needed

### Get Your Credentials

From your Supabase project settings:
1. Copy your **Project URL** → `SUPABASE_URL` in `.env`
2. Copy your **API Key** (service_role or anon) → `SUPABASE_KEY` in `.env`