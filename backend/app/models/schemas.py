from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any, Union
import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    password: str

class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    experience: float
    position: str
    location: str
    tech_stack: Union[str, List[str]]

class CandidateResponse(CandidateCreate):
    id: str
    status: str
    created_at: datetime.datetime

class InterviewStart(BaseModel):
    candidate: CandidateCreate

class InterviewMessage(BaseModel):
    content: str
    role: str

class InterviewStatus(BaseModel):
    interview_id: str
    current_step: str
    candidate_name: str
    messages: List[Dict[str, Any]]

class ScoreSchema(BaseModel):
    category: str
    score: float
    strengths: List[str]
    improvements: List[str]
    assessment: str

class ResumeAnalysis(BaseModel):
    id: str
    file_path: str
    score: float
    skills_found: List[str]
    analysis_json: Dict[str, Any]

class KeywordCreate(BaseModel):
    keyword: str
    category: str
    weight: float = 1.0

class KeywordResponse(KeywordCreate):
    id: str
