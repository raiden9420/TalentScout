# TalentScout - AI-Powered Hiring Assistant

## Project Overview
TalentScout is an intelligent chatbot that streamlines the technical hiring process. It conducts interactive interviews, assesses candidates' technical skills, and provides detailed analytics for hiring managers. The assistant adapts its questions based on candidates' tech stacks and provides comprehensive evaluations of their responses.

## Installation Instructions

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Ensure .env is set with GEMINI_API_KEY and SUPABASE_URL/KEY
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the App**
   Open http://localhost:3000 in your browser.

## Technical Details

### Architecture
- **Frontend**: Next.js (React)
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini AI

### Key Components
1. `backend/app/main.py`: FastAPI entry point
2. `backend/app/services`: Business logic (Gemini, Interview flow)
3. `frontend/src/app`: Next.js pages (Interview, Resume, Admin)
4. `supabase_schema.sql`: Database structure

## Features
- **AI Interview**: Conducts technical interviews with adaptive questions.
- **Resume Analyzer**: Parses PDF resumes and matches keywords (simulated or AI-powered).
- **Admin Dashboard**: View candidate statuses and stats.
