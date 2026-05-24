from fastapi import APIRouter, Depends, HTTPException
from core.auth import get_current_user
from core.supabase import get_supabase

router = APIRouter()


@router.get("")
async def list_contests():
    supabase = get_supabase()
    result = (
        supabase.table("contests")
        .select("id,title,slug,description,difficulty,start_time,end_time,participant_count,prize_pool")
        .eq("is_active", True)
        .order("start_time", desc=True)
        .execute()
    )
    return result.data


@router.get("/{slug}")
async def get_contest(slug: str):
    supabase = get_supabase()
    result = (
        supabase.table("contests")
        .select("*, contest_challenges(challenge_id, points, challenges(id,title,slug,difficulty,xp_reward))")
        .eq("slug", slug)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Contest not found")
    return result.data


@router.post("/{contest_id}/join")
async def join_contest(
    contest_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    try:
        supabase.table("contest_participants").insert({
            "contest_id": contest_id,
            "user_id":    user["id"],
        }).execute()
        supabase.table("contests").update({
            "participant_count": supabase.table("contests").select("participant_count").eq("id", contest_id).single().execute().data["participant_count"] + 1
        }).eq("id", contest_id).execute()
    except Exception:
        raise HTTPException(status_code=400, detail="Already joined or contest not found")
    return {"joined": True}
