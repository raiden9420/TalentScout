from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.resume_service import extract_text_from_pdf, analyze_resume_text, save_resume
from app.database import get_supabase

router = APIRouter()

@router.post("/analyze")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    candidate_id: str = Form(...)
):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        
        sb = get_supabase()
        
        # Handle dummy/missing candidate
        target_candidate_id = candidate_id
        if not candidate_id or candidate_id == "00000000-0000-0000-0000-000000000000":
            # Create a guest candidate
            guest_user = sb.table("candidates").insert({
                "name": "Guest Candidate",
                "email": "guest@example.com",
                "status": "Resume Uploaded"
            }).execute()
            if guest_user.data:
                target_candidate_id = guest_user.data[0]["id"]
            else:
                raise HTTPException(status_code=500, detail="Failed to create guest candidate")
        else:
             # Verify candidate exists
            check = sb.table("candidates").select("id").eq("id", candidate_id).execute()
            if not check.data:
                # If not found, create one or fail. Let's create one to be safe for demo.
                 guest_user = sb.table("candidates").insert({
                    "id": candidate_id, # Try to use the provided ID if UUID valid, else let DB gen
                    "name": "Unknown Candidate",
                    "email": "unknown@example.com"
                }).execute()
                 # If the ID was invalid UUID, the above might fail.
                 # Better to just create a new one if not found.
                 if not guest_user.data:
                     # Fallback to creating new without ID
                     guest_user = sb.table("candidates").insert({
                        "name": "Guest Candidate",
                        "email": "guest@example.com"
                    }).execute()
                     target_candidate_id = guest_user.data[0]["id"]

        content = extract_text_from_pdf(file.file)
        analysis = analyze_resume_text(content)
        
        result = save_resume(target_candidate_id, file.filename, content, analysis)
        
        return result
    except Exception as e:
        print(f"Error in analyze_resume: {e}") # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/keywords")
async def get_keywords():
    try:
        sb = get_supabase()
        res = sb.table("resume_keywords").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/keywords")
async def add_keyword(keyword: str, category: str, weight: float = 1.0):
    try:
        sb = get_supabase()
        res = sb.table("resume_keywords").insert({
            "keyword": keyword, 
            "category": category, 
            "weight": weight
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
