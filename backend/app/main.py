from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import interviews, candidates, resumes, auth
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="TalentScout API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(resumes.router, prefix="/api/resumes", tags=["Resumes"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "TalentScout API"}
# Force reload
