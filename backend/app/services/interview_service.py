"""Stateless interview flow engine – powered by conversation-driven AI agent.

Each interview row in Supabase tracks *current_step*. The AI agent decides
when to transition between phases based on the full conversation history.
"""

from __future__ import annotations
import json
from typing import Any

from app.database import get_supabase
from app.services.gemini_service import (
    generate_next_message,
    generate_interview_report,
)


def start_interview(candidate_data: dict) -> dict:
    """Create candidate + interview rows and generate the first AI message."""
    sb = get_supabase()

    # Normalize tech_stack to a clean string for DB storage
    tech_stack = candidate_data.get("tech_stack", "")
    if isinstance(tech_stack, list):
        tech_stack_str = ", ".join(tech_stack)
    else:
        tech_stack_str = tech_stack

    # Insert candidate
    candidate_row = (
        sb.table("candidates")
        .insert(
            {
                "name": candidate_data["name"],
                "email": candidate_data["email"],
                "phone": candidate_data.get("phone", ""),
                "experience": candidate_data.get("experience", 0),
                "position": candidate_data.get("position", "Software Engineer"),
                "location": candidate_data.get("location", ""),
                "tech_stack": tech_stack_str,
                "status": "In Progress",
            }
        )
        .execute()
    )
    candidate_id = candidate_row.data[0]["id"]

    # Create interview session
    interview_row = (
        sb.table("interviews")
        .insert(
            {
                "candidate_id": candidate_id,
                "current_step": "technical",
                "metadata": {"phases_visited": ["technical"]},
            }
        )
        .execute()
    )
    interview_id = interview_row.data[0]["id"]

    # Generate first AI message using the agent
    ai_result = generate_next_message(
        candidate_info=candidate_data,
        messages=[],  # No messages yet
        current_phase="technical",
    )

    greeting = ai_result["reply"]

    # Store the assistant message
    _store_message(interview_id, "assistant", greeting, "technical")

    return {
        "interview_id": interview_id,
        "candidate_id": candidate_id,
        "message": greeting,
        "current_step": "technical",
    }


def process_message(interview_id: str, user_content: str) -> dict:
    """Handle a user message and return the AI's dynamic response."""
    sb = get_supabase()

    # Fetch interview + candidate
    interview = (
        sb.table("interviews")
        .select("*, candidates(*)")
        .eq("id", interview_id)
        .single()
        .execute()
    )
    data = interview.data
    step = data["current_step"]
    candidate = data["candidates"]

    if step == "completed":
        return {
            "message": "This interview has already been completed. Thank you!",
            "current_step": "completed",
        }

    # Store user message
    _store_message(interview_id, "user", user_content, step)

    # Fetch full message history
    msgs_res = (
        sb.table("interview_messages")
        .select("role, content")
        .eq("interview_id", interview_id)
        .order("created_at")
        .execute()
    )
    messages = [{"role": m["role"], "content": m["content"]} for m in msgs_res.data]

    # Build candidate info for the agent
    tech_stack = candidate.get("tech_stack", "")
    candidate_info = {
        "name": candidate.get("name", "Candidate"),
        "position": candidate.get("position", "Software Engineer"),
        "experience": candidate.get("experience", 0),
        "tech_stack": tech_stack,
        "location": candidate.get("location", ""),
    }

    # Call the AI agent
    ai_result = generate_next_message(
        candidate_info=candidate_info,
        messages=messages,
        current_phase=step,
    )

    reply = ai_result["reply"]
    next_step = ai_result["phase"]

    # Save score if the AI assessed the last answer
    if ai_result.get("score") is not None:
        _save_score(interview_id, step, {
            "score": ai_result["score"],
            "assessment": ai_result.get("assessment", ""),
        })

    # Update interview state
    update_data: dict[str, Any] = {"current_step": next_step}

    if next_step == "completed":
        update_data["completed_at"] = "now()"
        sb.table("candidates").update({"status": "Completed"}).eq(
            "id", candidate["id"]
        ).execute()

    sb.table("interviews").update(update_data).eq("id", interview_id).execute()

    # Store assistant reply
    _store_message(interview_id, "assistant", reply, next_step)

    return {"message": reply, "current_step": next_step}


def get_interview_status(interview_id: str) -> dict:
    sb = get_supabase()
    interview = (
        sb.table("interviews")
        .select("*, candidates(name), interview_messages(*)")
        .eq("id", interview_id)
        .single()
        .execute()
    )
    d = interview.data
    messages = sorted(d.get("interview_messages", []), key=lambda m: m["created_at"])
    return {
        "interview_id": d["id"],
        "current_step": d["current_step"],
        "candidate_name": d["candidates"]["name"],
        "messages": [
            {"role": m["role"], "content": m["content"], "step": m["step"]}
            for m in messages
        ],
    }


def get_interview_report(interview_id: str) -> dict:
    """Generate a comprehensive interview report."""
    sb = get_supabase()

    # Fetch interview + candidate
    interview = (
        sb.table("interviews")
        .select("*, candidates(*)")
        .eq("id", interview_id)
        .single()
        .execute()
    )
    candidate = interview.data["candidates"]

    # Fetch scores
    scores = (
        sb.table("interview_scores")
        .select("*")
        .eq("interview_id", interview_id)
        .execute()
    )

    # Fetch messages
    msgs = (
        sb.table("interview_messages")
        .select("role, content")
        .eq("interview_id", interview_id)
        .order("created_at")
        .execute()
    )

    return generate_interview_report(
        candidate_info=candidate,
        scores=scores.data,
        messages=msgs.data,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _store_message(interview_id: str, role: str, content: str, step: str) -> None:
    get_supabase().table("interview_messages").insert(
        {
            "interview_id": interview_id,
            "role": role,
            "content": content,
            "step": step,
        }
    ).execute()


def _save_score(interview_id: str, category: str, analysis: dict) -> None:
    get_supabase().table("interview_scores").insert(
        {
            "interview_id": interview_id,
            "category": category,
            "score": analysis.get("score", 5),
            "strengths": analysis.get("strengths", []),
            "improvements": analysis.get("improvements", []),
            "assessment": analysis.get("assessment", ""),
        }
    ).execute()
