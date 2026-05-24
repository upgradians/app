from fastapi import APIRouter, Query
from core.supabase import get_supabase

router = APIRouter()


@router.get("")
async def get_leaderboard(
    limit:  int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    supabase = get_supabase()
    result = (
        supabase.table("leaderboard")
        .select("*")
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"data": result.data, "limit": limit, "offset": offset}
