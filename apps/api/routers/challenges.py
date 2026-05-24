from fastapi import APIRouter, HTTPException, Query
from core.supabase import get_supabase

router = APIRouter()


@router.get("")
async def list_challenges(
    lang:   str | None = None,
    diff:   str | None = None,
    q:      str | None = None,
    page:   int = Query(1, ge=1),
    limit:  int = Query(20, ge=1, le=100),
):
    supabase = get_supabase()
    offset = (page - 1) * limit

    query = (
        supabase.table("challenges")
        .select("id,title,slug,difficulty,language,xp_reward,tags,acceptance_rate,solved_by")
        .eq("is_active", True)
        .order("difficulty")
        .range(offset, offset + limit - 1)
    )

    if lang:  query = query.eq("language", lang)
    if diff:  query = query.eq("difficulty", diff)
    if q:     query = query.ilike("title", f"%{q}%")

    result = query.execute()
    return {"data": result.data, "page": page, "limit": limit}


@router.get("/{slug}")
async def get_challenge(slug: str):
    supabase = get_supabase()
    result = (
        supabase.table("challenges")
        .select("*, test_cases!inner(id,input,expected_output,order_index)")
        .eq("slug", slug)
        .eq("is_active", True)
        .eq("test_cases.is_hidden", False)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return result.data
