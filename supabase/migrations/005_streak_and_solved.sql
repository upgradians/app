-- ============================================================
-- STREAK SYSTEM & CHALLENGES SOLVED TRACKING
-- ============================================================

-- Add last_streak_date if not present (may have been added earlier)
alter table public.profiles
  add column if not exists last_streak_date date;

-- Track which seed challenge IDs the user has already solved (prevents double-counting)
alter table public.profiles
  add column if not exists solved_seed_ids text[] not null default '{}';

-- ============================================================
-- Function: update_streak_on_submission
-- Called by the application after a successful submission.
-- Safe to call multiple times on the same day (idempotent).
-- ============================================================
create or replace function public.update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_last_date   date;
  v_streak      int;
  v_today       date := current_date;
begin
  select last_streak_date, streak_days
    into v_last_date, v_streak
    from public.profiles
   where id = p_user_id;

  if v_last_date = v_today then
    -- Already counted today, nothing to do
    return;
  elsif v_last_date = v_today - interval '1 day' then
    -- Consecutive day: extend streak
    v_streak := coalesce(v_streak, 0) + 1;
  else
    -- Gap: reset
    v_streak := 1;
  end if;

  update public.profiles
     set streak_days      = v_streak,
         last_streak_date = v_today,
         last_active_at   = now()
   where id = p_user_id;
end;
$$;

-- Grant execute to service role
grant execute on function public.update_streak(uuid) to service_role;
