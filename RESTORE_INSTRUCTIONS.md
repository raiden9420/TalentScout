# ✅ Codebase Full Restoration

I have restored the `backend` and `frontend` folders and the database schema.

## Next Steps

1.  **Configure API Key**:
    *   Open `backend/.env`.
    *   Replace `your_gemini_key_here` with your actual Gemini API Key. (Supabase keys are pre-filled).

2.  **Wait for Dependencies**:
    *   The `pip install` command is currently running in the background. Please wait for it to finish (or run `pip install -r requirements.txt` manually if unsure).

3.  **Start Servers**:
    *   **Backend**: `cd backend` then `python -m uvicorn app.main:app --reload --port 8000`
    *   **Frontend**: `cd frontend` then `npm run dev`

4.  **Database**:
    *   Run this SQL in Supabase: `ALTER TABLE interviews ADD COLUMN IF NOT EXISTS metadata jsonb default '{}'::jsonb;`

You are ready to go! 🚀
