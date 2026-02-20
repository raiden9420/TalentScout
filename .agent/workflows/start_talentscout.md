---
description: Start the TalentScout application (Backend & Frontend)
---

# Start TalentScout

This workflow installs dependencies and starts both the FastAPI backend and Next.js frontend.

## 1. Backend Setup & Run

// turbo
Install dependencies and start the backend server.
```powershell
cd backend
python -m pip install -r requirements.txt
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"
```

## 2. Frontend Setup & Run

// turbo
Install dependencies and start the frontend server.
```powershell
cd frontend
npm install
npm run dev
```
