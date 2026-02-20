from fastapi import APIRouter, HTTPException, Query
from app.database import get_supabase
from typing import List, Optional

router = APIRouter()

@router.get("/")
async def list_candidates(status: Optional[str] = None):
    try:
        sb = get_supabase()
        query = sb.table("candidates").select("*").order("created_at", desc=True)
        if status:
            query = query.eq("status", status)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str):
    try:
        sb = get_supabase()
        res = sb.table("candidates").select("*").eq("id", candidate_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{candidate_id}/scores")
async def get_candidate_scores(candidate_id: str):
    try:
        sb = get_supabase()
        # Get interview ID first
        interview = sb.table("interviews").select("id").eq("candidate_id", candidate_id).single().execute()
        if not interview.data:
            return []
            
        scores = sb.table("interview_scores").select("*").eq("interview_id", interview.data["id"]).execute()
        return scores.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/summary")
async def get_stats():
    try:
        sb = get_supabase()
        candidates = sb.table("candidates").select("id", "status", count="exact").execute()
        total = candidates.count
        
        # Simplified stats for demo
        completed = sb.table("candidates").select("*", count="exact").eq("status", "Completed").execute().count
        
        # Calculate average score
        scores_res = sb.table("interview_scores").select("score").execute()
        scores = [s["score"] for s in scores_res.data if s["score"] is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
        
        return {
            "total_candidates": total,
            "completed_interviews": completed,
            "avg_score": avg_score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
