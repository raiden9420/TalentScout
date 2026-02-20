from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database import get_supabase
from app.services.interview_service import start_interview, process_message, get_interview_status, get_interview_report
from app.models.schemas import InterviewStart, InterviewMessage, InterviewStatus

router = APIRouter()

@router.post("/start")
async def start_new_interview(data: InterviewStart):
    try:
        result = start_interview(data.candidate.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{interview_id}/message")
async def send_message(interview_id: str, message: InterviewMessage):
    try:
        result = process_message(interview_id, message.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{interview_id}/status")
async def get_status(interview_id: str):
    try:
        result = get_interview_status(interview_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail="Interview not found")

@router.get("/{interview_id}/report")
async def get_report(interview_id: str):
    try:
        result = get_interview_report(interview_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
