# TalentScout

TalentScout is an end-to-end AI-powered technical hiring platform designed to automate and improve the early stages of the recruitment pipeline. It serves two distinct users: **candidates** who go through a structured, conversational interview experience, and **recruitment managers** who review results, track candidate progress, and make data-driven hiring decisions through a dedicated admin dashboard. The platform replaces manual screening calls with an intelligent AI agent that conducts multi-phase technical interviews, adapts its questions in real time based on the candidate's responses, scores each answer individually, and produces a comprehensive evaluation report at the end of every session. In addition to interviews, TalentScout includes a resume analysis module that accepts PDF uploads, extracts skills from the document, and matches them against a configurable keyword database to produce a compatibility score. The entire system is built on a modern stack: a FastAPI backend handles business logic and AI orchestration, a Next.js frontend delivers a responsive and polished user interface, Supabase provides persistent PostgreSQL storage, and Google Gemini AI powers the conversational intelligence behind the interview agent.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Usage Guide](#usage-guide)
- [Technical Design Decisions](#technical-design-decisions)

---

## Overview

### The Problem

Technical hiring at scale is time-consuming and inconsistent. Recruiters spend hours conducting initial screening calls, and the quality of those screenings varies depending on the interviewer, their familiarity with the candidate's tech stack, and the questions they happen to ask. Candidates, in turn, often receive a disjointed experience that does not reflect the role they are applying for.

### The Solution

TalentScout addresses this by automating the screening interview entirely. The AI agent takes over the initial technical assessment, ensuring every candidate receives a consistent, fair, and role-relevant interview experience. The system is designed around two workflows:

**For candidates**, the experience begins on the interview page. They enter their personal details, select the technologies they work with using a tag-based input, and start the interview. The AI agent greets them by name, asks questions tailored to their declared tech stack, and guides them through five structured phases: Technical, Projects, Problem Solving, Behavioral, and Completion. The agent follows up on interesting or vague answers, increases difficulty when the candidate performs well, and eases off when they struggle. At the end, the candidate receives a warm closing message summarizing their strengths.

**For recruitment managers**, the admin dashboard provides a centralized view of all candidate activity. Managers log in with a password-protected admin account and can browse candidates by status (New, In Progress, Completed), view per-phase scores and written assessments, inspect tech stack tags, and review aggregate statistics such as total candidates screened, average score, and completion rate. Each candidate row is expandable, revealing the full breakdown of their interview performance without navigating away from the dashboard. This allows hiring teams to quickly identify strong candidates and make informed decisions about who to advance to the next round.

The platform also includes a standalone resume analyzer. Recruiters or candidates can upload a PDF resume, which the system parses to extract skills and match them against a configurable keyword database. The result is a compatibility score alongside a list of matched and missing skills, useful for pre-screening before or after the interview.

Together, these components form a complete initial screening toolkit that is consistent, scalable, and transparent for both sides of the hiring process.

---

## Features

### AI Interview Engine
- Conversation-driven agent powered by Google Gemini (2.5-flash with automatic fallback to 2.0-flash and 2.0-flash-lite).
- Five interview phases: Technical, Projects, Problem Solving, Behavioral, and Completion.
- Inline scoring (0-10) and one-line assessment for every candidate response.
- Phase transitions are decided autonomously by the AI based on conversation flow.
- Full chat history is passed on every turn, enabling contextual follow-ups.

### Resume Analyzer
- Accepts PDF uploads and extracts text using PyMuPDF.
- Matches extracted skills against a configurable keyword database.
- Returns a compatibility score and a breakdown of matched vs. missing skills.

### Admin Dashboard
- View all candidates with filterable status (New, In Progress, Completed).
- Expandable rows showing per-phase scores, assessments, and tech stack tags.
- Summary statistics: total candidates, average score, completion rate.

### Frontend
- Responsive single-page application built with Next.js 14.
- Tag-based tech stack input with autocomplete for 100+ technologies.
- Real-time chat interface with typing indicators.
- Animated progress bar tracking interview phases.
- Interview completion screen summarizing next steps.

---

## Architecture

```
                    +-------------------+
                    |   Next.js (3000)  |
                    |    Frontend SPA   |
                    +---------+---------+
                              |
                         HTTP / JSON
                              |
                    +---------+---------+
                    |  FastAPI (8000)   |
                    |   Backend API     |
                    +---------+---------+
                         /         \
                        /           \
             +---------+--+    +----+---------+
             |  Supabase  |    | Google Gemini|
             | PostgreSQL |    |   AI API     |
             +------------+    +--------------+
```

| Layer     | Technology                  | Purpose                                     |
|-----------|-----------------------------|---------------------------------------------|
| Frontend  | Next.js 14, React 18        | UI, routing, client-side state management    |
| Backend   | FastAPI, Uvicorn            | REST API, business logic, request validation |
| Database  | Supabase (PostgreSQL)       | Persistent storage, row-level security       |
| AI        | Google Gemini (generativeai)| Interview agent, resume analysis, reporting  |
| Auth      | JWT + Admin password        | Simple token-based access control            |

---

## Project Structure

```
TalentScout/
|
|-- backend/
|   |-- app/
|   |   |-- main.py                  # FastAPI entry point, CORS, router mounting
|   |   |-- config.py                # Environment variable loading
|   |   |-- database.py              # Supabase client initialization
|   |   |-- models/
|   |   |   |-- schemas.py           # Pydantic request/response schemas
|   |   |-- routers/
|   |   |   |-- interviews.py        # /api/interviews endpoints
|   |   |   |-- candidates.py        # /api/candidates endpoints
|   |   |   |-- resumes.py           # /api/resumes endpoints
|   |   |   |-- auth.py              # /api/auth endpoints
|   |   |-- services/
|   |   |   |-- gemini_service.py    # Gemini AI integration, prompt engineering
|   |   |   |-- interview_service.py # Interview lifecycle management
|   |   |   |-- resume_service.py    # PDF parsing and keyword matching
|   |   |-- utils/
|   |       |-- validators.py        # Input validation helpers
|   |-- requirements.txt             # Python dependencies
|   |-- .env                         # API keys (not committed)
|
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |   |-- page.js              # Home / landing page
|   |   |   |-- layout.js            # Root layout with navbar
|   |   |   |-- globals.css          # Global styles and design tokens
|   |   |   |-- interview/page.js    # Interview interface
|   |   |   |-- resume/page.js       # Resume analyzer interface
|   |   |   |-- admin/page.js        # Admin dashboard
|   |   |   |-- login/page.js        # Admin login
|   |   |-- components/
|   |   |   |-- Navbar.js            # Navigation bar
|   |   |-- lib/
|   |       |-- api.js               # API client (fetch wrapper)
|   |-- package.json
|
|-- supabase_schema.sql              # Database table definitions
|-- .gitignore
|-- README.md
```

---

## Prerequisites

- **Python** 3.10 or later
- **Node.js** 18 or later (with npm)
- **Supabase** account (free tier works)
- **Google Gemini API key** (obtainable from [Google AI Studio](https://aistudio.google.com/))

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/raiden9420/TalentScout.git
cd TalentScout
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password
```

| Variable         | Description                                           |
|------------------|-------------------------------------------------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI functionality             |
| `SUPABASE_URL`   | Your Supabase project URL                             |
| `SUPABASE_KEY`   | Supabase service role key (not the anon key)          |
| `JWT_SECRET`     | Secret string for signing JWT tokens                  |
| `ADMIN_PASSWORD` | Password for accessing the admin dashboard            |

> **Important**: The `.env` file is excluded from version control via `.gitignore`. Never commit API keys to the repository.

---

## Database Setup

1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Copy the contents of `supabase_schema.sql` and execute it.

This creates the following tables:

| Table                | Purpose                                       |
|----------------------|-----------------------------------------------|
| `candidates`         | Candidate profiles and contact information    |
| `interviews`         | Interview sessions with phase tracking        |
| `interview_messages` | Full conversation transcript per interview    |
| `interview_scores`   | Per-phase scoring and assessment data         |
| `resumes`            | Uploaded resume metadata and analysis results |
| `resume_keywords`    | Configurable keyword list for resume matching |

Row-level security policies are included and set to public access for demonstration purposes. Adjust these for production use.

---

## Running the Application

### Start the Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### Start the Frontend

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## API Reference

### Interviews

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| POST   | `/api/interviews/start`            | Start a new interview session        |
| POST   | `/api/interviews/{id}/message`     | Send a candidate message             |
| GET    | `/api/interviews/{id}/status`      | Get interview status and transcript  |
| GET    | `/api/interviews/{id}/report`      | Generate AI interview report         |

### Candidates

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| GET    | `/api/candidates`                  | List all candidates (filterable)     |
| GET    | `/api/candidates/{id}`             | Get a specific candidate             |
| GET    | `/api/candidates/{id}/scores`      | Get interview scores for a candidate |
| GET    | `/api/candidates/stats/summary`    | Aggregate statistics                 |

### Resumes

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| POST   | `/api/resumes/analyze`             | Upload and analyze a PDF resume      |
| GET    | `/api/resumes/keywords`            | List configured keywords             |
| POST   | `/api/resumes/keywords`            | Add a new keyword                    |

### Auth

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| POST   | `/api/auth/login`                  | Authenticate with admin password     |

---

## Usage Guide

### Conducting an Interview

1. Open `http://localhost:3000` and navigate to **Interview**.
2. Fill in the candidate information form: name, email, phone, experience, position, and location.
3. Add technologies to the tech stack using the tag input (type and press Enter).
4. Click **Begin Interview** to start the AI-driven conversation.
5. The AI will greet the candidate and begin asking technical questions based on the declared tech stack.
6. The progress bar at the top tracks the current phase (Technical, Projects, Problem Solving, Behavioral, Complete).
7. The AI transitions between phases automatically based on the conversation.

### Analyzing a Resume

1. Navigate to **Resume**.
2. Upload a PDF file by dragging it into the drop zone or clicking to browse.
3. The system extracts text, identifies skills, and returns a match score against the configured keyword database.

### Reviewing Candidates (Admin)

1. Navigate to **Admin** and log in with the configured admin password.
2. View all candidates with their status, tech stack, and scores.
3. Click on a candidate row to expand and see per-phase scores and assessments.
4. Summary cards at the top show total candidates, average score, and completion rate.

---

## Technical Design Decisions

### Conversation-Driven AI Agent
Rather than using a fixed question bank, the interview agent receives the full conversation history on every turn and autonomously decides what to ask next. This enables contextual follow-ups (e.g., probing a vague answer) and natural phase transitions without rigid step counters.

### Model Fallback Chain
The Gemini integration attempts three models in sequence: `gemini-2.5-flash`, `gemini-2.0-flash`, and `gemini-2.0-flash-lite`. If one model's rate limit is exhausted, the system automatically falls back to the next. This maximizes availability on the free tier.

### Robust JSON Extraction
The AI is instructed to respond in JSON, but LLMs occasionally wrap output in markdown fences or add extraneous text. The `_extract_json()` function handles three extraction strategies: direct parsing, markdown fence stripping, and regex-based `{...}` block extraction.

### Stateless Backend
All interview state is persisted in Supabase. The backend is fully stateless and horizontally scalable. Each API call reconstructs context from the database, making the system resilient to server restarts.

### Flexible Tech Stack Input
The `CandidateCreate` schema accepts `tech_stack` as either a string or a list of strings (`Union[str, List[str]]`). The backend normalizes list inputs to comma-separated strings before database storage, maintaining backward compatibility.

---

## License

This project is intended for educational and demonstration purposes.
