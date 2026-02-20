"""Gemini AI integration service – conversation-driven interview agent."""

from __future__ import annotations

import json
import re
import time
import logging
from typing import Any

import google.generativeai as genai

from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

_configured = False
MAX_RETRIES = 3
BASE_DELAY = 1  # seconds


def _ensure_configured() -> None:
    global _configured
    if not _configured:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set in backend/.env")
        genai.configure(api_key=GEMINI_API_KEY)
        _configured = True


MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]


def _get_model(model_name: str = None):
    _ensure_configured()
    return genai.GenerativeModel(model_name or MODELS[0])


def _extract_json(text: str) -> dict | None:
    """Try to extract a JSON object from text that might contain markdown fences."""
    # Try direct parse first
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass

    # Try stripping markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = cleaned.strip().rstrip("`")
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        pass

    # Try finding first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except (json.JSONDecodeError, TypeError):
            pass

    return None


# ---------------------------------------------------------------------------
# Core: conversation-driven interview agent
# ---------------------------------------------------------------------------

INTERVIEW_SYSTEM_PROMPT = """\
You are **TalentScout**, a world-class AI technical recruiter conducting a live interview.

## Your persona
- Friendly, professional, encouraging, and concise.
- You address the candidate by first name.
- You NEVER repeat the same question twice.
- You NEVER give generic filler like "Thanks for those insights" when the answer was poor.

## Interview structure (phases)
Move through these phases naturally. You decide when to advance – typically after 2-4 exchanges per phase.

1. **technical** – Ask questions specific to the candidate's tech stack. Start easy, increase difficulty based on their answers. Ask follow-up questions if an answer is vague or interesting.
2. **project** – Ask about real projects, challenges faced, technologies used, their role, and outcomes.
3. **problem_solving** – Present a scenario or ask about debugging/architecture decisions.
4. **behavioral** – Teamwork, communication, conflict resolution, learning habits.
5. **completed** – Wrap up. Thank the candidate warmly, mention 2-3 specific strengths you noticed. Tell them the hiring team will review their profile.

## Rules
- Ask ONE question at a time (never a numbered list).
- If the candidate gives a low-effort answer ("idk", "nil", very short), gently encourage them or move on. Do not praise empty answers.
- Adjust difficulty dynamically: if they answer well, go harder; if they struggle, ease up.
- Keep responses concise (3-5 sentences max).
- When you decide the interview is complete, set phase to "completed".

## Response format
You MUST respond with a JSON object containing these keys:
- "reply": your conversational message to the candidate
- "phase": current phase (technical | project | problem_solving | behavioral | completed)
- "score": 0-10 score for the candidate's LAST answer, or null if this is the opening message
- "assessment": brief 1-line assessment of their last answer, or null if opening
"""


def generate_next_message(
    candidate_info: dict,
    messages: list[dict],
    current_phase: str,
) -> dict[str, Any]:
    """Generate the next interviewer message using full conversation context."""
    tech_stack = candidate_info.get("tech_stack", "General")
    if isinstance(tech_stack, list):
        tech_stack = ", ".join(tech_stack)

    context_block = f"""
## Candidate Profile
- Name: {candidate_info.get('name', 'Candidate')}
- Position: {candidate_info.get('position', 'Software Engineer')}
- Experience: {candidate_info.get('experience', 0)} years
- Tech Stack: {tech_stack}
- Location: {candidate_info.get('location', 'Not specified')}
- Current Phase: {current_phase}
"""

    # Build full prompt with system instructions + conversation history
    conversation_lines = []
    for msg in messages:
        label = "Candidate" if msg["role"] == "user" else "TalentScout"
        conversation_lines.append(f"{label}: {msg['content']}")

    conversation_text = "\n".join(conversation_lines) if conversation_lines else "(No messages yet – this is the start of the interview.)"

    # The prompt for the current turn
    if not messages:
        instruction = "This is the START of the interview. Greet the candidate by name, welcome them, and then ask your first technical question based on their tech stack."
    else:
        instruction = """The candidate just replied. Continue the interview naturally.
- Do NOT repeat any previous question.
- Reference what they just said in your response.
- Decide whether to ask a follow-up, move to the next topic, or transition to a new phase."""

    full_prompt = f"""{INTERVIEW_SYSTEM_PROMPT}

{context_block}

## Conversation so far
{conversation_text}

## Your task
{instruction}

Respond ONLY with a valid JSON object."""

    for model_name in MODELS:
        for attempt in range(MAX_RETRIES):
            try:
                model = _get_model(model_name)
                response = model.generate_content(
                    full_prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=800,
                    ),
                )

                raw_text = response.text
                logger.info(f"Gemini [{model_name}] response (attempt {attempt+1}): {raw_text[:300]}")

                result = _extract_json(raw_text)
                if result and "reply" in result:
                    return {
                        "reply": result["reply"],
                        "phase": result.get("phase", current_phase),
                        "score": result.get("score"),
                        "assessment": result.get("assessment"),
                    }
                else:
                    logger.warning(f"Gemini returned invalid JSON structure: {raw_text[:300]}")
                    # If we got text but not valid JSON, use the raw text as reply
                    if raw_text and len(raw_text) > 10:
                        return {
                            "reply": raw_text.strip(),
                            "phase": current_phase,
                            "score": None,
                            "assessment": None,
                        }

            except Exception as e:
                logger.error(f"Gemini [{model_name}] error (attempt {attempt+1}/{MAX_RETRIES}): {type(e).__name__}: {e}")
                if "ResourceExhausted" in type(e).__name__:
                    # Rate limited — try next model immediately
                    logger.info(f"Rate limited on {model_name}, trying next model...")
                    break
                if attempt < MAX_RETRIES - 1:
                    time.sleep(BASE_DELAY * (2 ** attempt))
                    continue

    # Fallback if all retries fail
    logger.error("All Gemini retries exhausted – returning fallback message")
    return {
        "reply": "That's interesting! Could you elaborate on that a bit more? I'd love to understand your experience better.",
        "phase": current_phase,
        "score": None,
        "assessment": None,
    }


# ---------------------------------------------------------------------------
# Interview report generation
# ---------------------------------------------------------------------------

def generate_interview_report(
    candidate_info: dict,
    scores: list[dict],
    messages: list[dict],
) -> dict[str, Any]:
    """Generate a comprehensive interview report/summary."""
    tech_stack = candidate_info.get("tech_stack", "General")
    if isinstance(tech_stack, list):
        tech_stack = ", ".join(tech_stack)

    scores_text = "\n".join(
        f"- Phase: {s.get('category', 'unknown')}, Score: {s.get('score', 'N/A')}/10, Assessment: {s.get('assessment', 'N/A')}"
        for s in scores
    ) or "No scores recorded."

    conversation_text = "\n".join(
        f"{'Candidate' if m['role'] == 'user' else 'Interviewer'}: {m['content']}"
        for m in messages
    )

    prompt = f"""You are an expert HR analyst reviewing a completed technical interview.

## Candidate
- Name: {candidate_info.get('name')}
- Position: {candidate_info.get('position')}
- Experience: {candidate_info.get('experience')} years
- Tech Stack: {tech_stack}

## Scores by Phase
{scores_text}

## Full Transcript
{conversation_text}

## Instructions
Provide a comprehensive interview summary in this JSON format:
{{
    "overall_score": <weighted average 0-10>,
    "recommendation": "<Strong Hire | Hire | Maybe | No Hire>",
    "summary": "<2-3 sentence overall summary>",
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "improvements": ["<area 1>", "<area 2>", ...],
    "detailed_feedback": "<paragraph with specific observations from the interview>"
}}

Respond ONLY with valid JSON."""

    for attempt in range(MAX_RETRIES):
        try:
            _ensure_configured()
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(
                [prompt],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=1000,
                ),
            )
            result = _extract_json(response.text)
            if result:
                return result
        except Exception as e:
            logger.error(f"Report generation error (attempt {attempt+1}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(BASE_DELAY)
                continue

    # Fallback
    avg = sum(s.get("score", 5) for s in scores) / max(len(scores), 1)
    return {
        "overall_score": round(avg, 1),
        "recommendation": "Maybe",
        "summary": "Automated analysis unavailable. Manual review recommended.",
        "strengths": ["Completed the interview"],
        "improvements": ["Analysis could not be generated"],
        "detailed_feedback": "The AI analysis service was unavailable. Please review the interview transcript manually.",
    }


# ---------------------------------------------------------------------------
# Resume analysis helper (kept for resume endpoint)
# ---------------------------------------------------------------------------

def analyze_response(question: str, answer: str) -> dict[str, Any]:
    """Score a candidate answer (0-10) with strengths/improvements."""
    for attempt in range(MAX_RETRIES):
        try:
            _ensure_configured()
            model = genai.GenerativeModel("gemini-2.0-flash")
            prompt = f"""Analyze this interview response:

Question: {question}
Answer: {answer}

Respond with JSON:
{{
    "score": <0-10>,
    "strengths": [<list>],
    "improvements": [<list>],
    "overall_assessment": "<brief evaluation>"
}}

Respond ONLY with valid JSON."""

            response = model.generate_content(
                [prompt],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=500,
                ),
            )
            result = _extract_json(response.text)
            if result:
                return result
        except Exception as e:
            logger.error(f"Analyze response error: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(BASE_DELAY * (2 ** attempt))
                continue

    return {
        "score": 5,
        "strengths": ["Response provided"],
        "improvements": ["Unable to perform detailed analysis"],
        "overall_assessment": "Analysis unavailable – manual review recommended",
    }
