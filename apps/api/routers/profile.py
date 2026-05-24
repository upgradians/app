from fastapi import APIRouter, Depends
from pydantic import BaseModel
from core.auth import get_current_user
from core.supabase import get_supabase

router = APIRouter()


class ProfileUpdate(BaseModel):
    full_name:       str | None = None
    bio:             str | None = None
    college:         str | None = None
    graduation_year: int | None = None
    github_url:      str | None = None
    linkedin_url:    str | None = None


@router.get("/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("profiles").select("*").eq("id", user["id"]).single().execute()
    return result.data


@router.patch("/me")
async def update_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return {"message": "Nothing to update"}
    result = supabase.table("profiles").update(updates).eq("id", user["id"]).execute()
    return result.data[0] if result.data else {}


@router.get("/me/stats")
async def get_my_stats(user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    profile = supabase.table("profiles").select("total_xp,rank,streak_days,challenges_solved").eq("id", user["id"]).single().execute()
    achievements = supabase.table("user_achievements").select("achievements(slug,title,icon)").eq("user_id", user["id"]).execute()
    recent_subs  = supabase.table("submissions").select("status,submitted_at,challenges(title)").eq("user_id", user["id"]).order("submitted_at", desc=True).limit(5).execute()
    return {
        "profile":      profile.data,
        "achievements": [a["achievements"] for a in (achievements.data or [])],
        "recent":       recent_subs.data or [],
    }
