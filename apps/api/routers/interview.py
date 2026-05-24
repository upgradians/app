from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, field_validator
import httpx
import json
import logging

from core.auth import get_current_user
from core.supabase import get_supabase
from core.config import settings
from main import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


class StartRequest(BaseModel):
    role:  str
    level: str

    @field_validator("role", "level")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be empty")
        if len(v) > 100:
            raise ValueError("value too long")
        return v.strip()


class CompleteRequest(BaseModel):
    answers: dict[str, str]

    @field_validator("answers")
    @classmethod
    def answers_not_empty(cls, v: dict[str, str]) -> dict[str, str]:
        if not v:
            raise ValueError("answers must not be empty")
        return v


async def call_openai(messages: list[dict], temperature: float = 0.7) -> str:
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": settings.OPENAI_MODEL,
                "messages": messages,
                "response_format": {"type": "json_object"},
                "temperature": temperature,
            },
        )
    if r.status_code != 200:
        logger.error("OpenAI error %d: %s", r.status_code, r.text[:200])
        raise HTTPException(status_code=502, detail="AI service error")
    data = r.json()
    return data["choices"][0]["message"]["content"]


@router.post("/start")
@limiter.limit("5/minute")
async def start_session(request: Request, body: StartRequest, user: dict = Depends(get_current_user)):
    content = await call_openai([
        {"role": "system", "content": f"You are a technical interviewer. Generate 5 interview questions for a {body.level} {body.role} developer. Return JSON: {{\"questions\": [{{\"id\": \"q1\", \"question\": \"...\", \"type\": \"technical|behavioral|coding\", \"difficulty\": \"easy|medium|hard\"}}]}}"},
        {"role": "user", "content": f"Generate interview questions for {body.level} {body.role}"},
    ])
    questions = json.loads(content).get("questions", [])

    supabase = get_supabase()
    session = supabase.table("interview_sessions").insert({
        "user_id": user["id"],
        "role":    body.role,
        "level":   body.level,
        "status":  "in_progress",
    }).execute()

    return {"session_id": session.data[0]["id"], "questions": questions}


@router.post("/{session_id}/complete")
@limiter.limit("5/minute")
async def complete_session(
    request: Request,
    session_id: str,
    body: CompleteRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    session = supabase.table("interview_sessions").select("role,level").eq("id", session_id).eq("user_id", user["id"]).single().execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    content = await call_openai([
        {"role": "system", "content": "You are a technical interview evaluator. Return valid JSON only."},
        {"role": "user", "content": f"Evaluate these answers for a {session.data['level']} {session.data['role']} developer:\n{json.dumps(body.answers)}\n\nReturn JSON: {{\"score\": 0-100, \"feedback\": \"...\", \"breakdown\": {{\"technical_knowledge\": 0-100, \"problem_solving\": 0-100, \"communication\": 0-100, \"code_quality\": 0-100}}}}"},
    ], temperature=0.3)

    evaluation = json.loads(content)
    xp_earned  = round((evaluation.get("score", 0) / 100) * 200)

    supabase.table("interview_sessions").update({
        "status":   "completed",
        "score":    evaluation.get("score"),
        "feedback": evaluation.get("feedback"),
    }).eq("id", session_id).execute()

    if xp_earned > 0:
        supabase.rpc("add_xp_to_profile", {"p_user_id": user["id"], "p_xp": xp_earned}).execute()

    return {**evaluation, "xp_earned": xp_earned}
