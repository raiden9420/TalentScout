from __future__ import annotations
import fitz  # PyMuPDF
import json
import logging
from typing import BinaryIO, List
from app.database import get_supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_stream: BinaryIO) -> str:
    """Extract text from PDF stream using PyMuPDF."""
    text = ""
    try:
        doc = fitz.open(stream=file_stream.read(), filetype="pdf")
        for page in doc:
            text += page.get_text()
    except Exception as e:
        logger.error(f"Error reading PDF: {e}")
        raise ValueError("Failed to extract text from PDF")
    return text

def analyze_resume_text(text: str) -> dict:
    """Analyze resume text against keywords in Supabase."""
    sb = get_supabase()
    
    # Fetch keywords
    keywords_res = sb.table("resume_keywords").select("*").execute()
    keywords = keywords_res.data
    
    # Calculate score
    found_skills = []
    total_score = 0
    max_score = 0
    
    normalized_text = text.lower()
    
    for kw in keywords:
        word = kw["keyword"].lower()
        weight = kw.get("weight", 1.0)
        max_score += weight
        
        if word in normalized_text:
            found_skills.append(kw["keyword"])
            total_score += weight
            
    # Calculate percentage (0-100) or 0-10 scale
    final_score = (total_score / max_score * 10) if max_score > 0 else 0
    
    return {
        "score": round(final_score, 1),
        "skills_found": found_skills,
        "total_keywords": len(keywords),
        "missing_keywords": [k["keyword"] for k in keywords if k["keyword"] not in found_skills]
    }

def save_resume(candidate_id: str, file_path: str, content_text: str, analysis: dict) -> dict:
    """Save analysis to Supabase."""
    sb = get_supabase()
    
    data = {
        "candidate_id": candidate_id,
        "file_path": file_path,
        "content_text": content_text,
        "skills_found": analysis["skills_found"],
        "score": analysis["score"],
        "analysis_json": analysis,
    }
    
    res = sb.table("resumes").insert(data).execute()
    return res.data[0]
