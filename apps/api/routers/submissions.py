from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, field_validator
import httpx

from core.auth import get_current_user
from core.supabase import get_supabase
from core.config import settings
from main import limiter

router = APIRouter()

JUDGE0_LANG_MAP = {
    "python":     71,
    "javascript": 63,
    "typescript": 74,
    "java":       62,
    "cpp":        54,
    "c":          50,
    "go":         60,
    "rust":       73,
}


class SubmissionRequest(BaseModel):
    challenge_id: str
    code:         str
    language:     str

    @field_validator("code")
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("code must not be empty")
        if len(v) > 65536:
            raise ValueError("code exceeds 64 KB limit")
        return v

    @field_validator("language")
    @classmethod
    def valid_language(cls, v: str) -> str:
        if v not in JUDGE0_LANG_MAP:
            raise ValueError(f"unsupported language: {v}")
        return v


async def run_judge0(code: str, lang_id: int, stdin: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{settings.JUDGE0_URL}/submissions",
            params={"base64_encoded": "false", "wait": "true"},
            headers={
                "Content-Type": "application/json",
                "X-RapidAPI-Key": settings.JUDGE0_API_KEY,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
            json={"source_code": code, "language_id": lang_id, "stdin": stdin},
        )
    return r.json()


@router.post("")
@limiter.limit("10/minute")
async def create_submission(
    request: Request,
    body: SubmissionRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase()

    challenge = supabase.table("challenges").select("id,xp_reward").eq("id", body.challenge_id).single().execute()
    if not challenge.data:
        raise HTTPException(status_code=404, detail="Challenge not found")

    test_cases = supabase.table("test_cases").select("*").eq("challenge_id", body.challenge_id).eq("is_hidden", False).execute()

    lang_id = JUDGE0_LANG_MAP.get(body.language)
    if not lang_id:
        raise HTTPException(status_code=400, detail="Unsupported language")

    all_passed   = True
    last_output  = ""
    total_runtime = 0
    total_memory  = 0
    count = len(test_cases.data)

    for tc in test_cases.data:
        result = await run_judge0(body.code, lang_id, tc["input"])
        actual   = (result.get("stdout") or "").strip()
        expected = (tc["expected_output"] or "").strip()

        if result.get("status", {}).get("description") != "Accepted" or actual != expected:
            all_passed  = False
            last_output = result.get("stderr") or result.get("stdout") or "Runtime Error"
            break

        last_output    = actual
        total_runtime += float(result.get("time") or 0) * 1000
        total_memory  += (result.get("memory") or 0) / 1024

    status     = "accepted" if all_passed else "wrong_answer"
    xp_earned  = challenge.data["xp_reward"] if all_passed else 0
    runtime_ms = round(total_runtime / max(count, 1))
    memory_mb  = round(total_memory  / max(count, 1), 2)

    sub = supabase.table("submissions").insert({
        "user_id":      user["id"],
        "challenge_id": body.challenge_id,
        "code":         body.code,
        "language":     body.language,
        "status":       status,
        "runtime_ms":   runtime_ms,
        "memory_mb":    memory_mb,
        "xp_earned":    xp_earned,
    }).execute()

    if all_passed:
        supabase.rpc("add_xp_to_profile", {"p_user_id": user["id"], "p_xp": xp_earned}).execute()

    return {
        "id":        sub.data[0]["id"] if sub.data else None,
        "status":    status,
        "output":    last_output,
        "runtime":   runtime_ms,
        "memory":    memory_mb,
        "xp_earned": xp_earned,
    }


@router.get("")
async def list_submissions(
    challenge_id: str | None = None,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    query = supabase.table("submissions").select("*").eq("user_id", user["id"]).order("submitted_at", desc=True).limit(50)
    if challenge_id:
        query = query.eq("challenge_id", challenge_id)
    result = query.execute()
    return result.data
