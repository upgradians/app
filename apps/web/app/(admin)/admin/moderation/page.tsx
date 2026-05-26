import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin – Moderation" };

export default async function ModerationPage() {
  const admin = await createAdminClient();

  const [
    { data: suspicious },
    { data: recentViolations },
    { data: modLogs },
    { count: totalSuspicious },
  ] = await Promise.all([
    // Flagged users
    admin
      .from("profiles")
      .select("id,username,full_name,violation_count,temp_ban_until,total_xp")
      .eq("suspicious_activity", true)
      .order("violation_count", { ascending: false })
      .limit(50),

    // Recent anti-cheat events
    admin
      .from("anti_cheat_events")
      .select("id,user_id,session_type,event_type,warning_count,is_disqualified,created_at")
      .order("created_at", { ascending: false })
      .limit(100),

    // Moderation action log
    admin
      .from("moderation_logs")
      .select("id,action,reason,created_at,target:profiles!target_id(username,full_name)")
      .order("created_at", { ascending: false })
      .limit(50),

    // Count
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("suspicious_activity", true),
  ]);

  // Build userId → username lookup for violations
  const violationUserIds = [...new Set((recentViolations ?? []).map(v => v.user_id))];
  const { data: violationProfiles } = violationUserIds.length > 0
    ? await admin
        .from("profiles")
        .select("id,username")
        .in("id", violationUserIds)
    : { data: [] };

  const usernameMap = Object.fromEntries(
    (violationProfiles ?? []).map(p => [p.id, p.username ?? "unknown"])
  );

  const eventColor: Record<string, string> = {
    fullscreen_exit: "text-red-400",
    tab_switch:      "text-orange-400",
    window_blur:     "text-yellow-400",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">
          Moderation <span className="text-brand">🛡️</span>
        </h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">
          Anti-cheat violations, suspicious users, and moderation history
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Suspicious Users",    value: totalSuspicious ?? 0,        color: "text-red-400",    icon: "🚨" },
          { label: "Recent Violations",   value: recentViolations?.length ?? 0, color: "text-orange-400", icon: "⚠️"  },
          { label: "Moderation Actions",  value: modLogs?.length       ?? 0,  color: "text-yellow-400", icon: "📋" },
          { label: "Temp Bans Active",    value: (suspicious ?? []).filter(u => u.temp_ban_until && new Date(u.temp_ban_until) > new Date()).length, color: "text-purple-400", icon: "🔒" },
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className={`text-3xl font-extrabold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--text-3)] mt-1 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Suspicious users */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
          <h2 className="font-bold text-sm text-[var(--text-1)]">Suspicious Users</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
            {totalSuspicious ?? 0}
          </span>
        </div>
        {(suspicious?.length ?? 0) === 0 ? (
          <div className="py-10 text-center text-[var(--text-3)] text-sm">No suspicious users flagged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                  {["User", "Violations", "Temp Ban Until", "XP", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {suspicious?.map(u => {
                  const isTempBanned = u.temp_ban_until && new Date(u.temp_ban_until) > new Date();
                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-3)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--text-1)]">{u.full_name ?? u.username}</div>
                        <div className="text-xs text-[var(--text-3)]">@{u.username}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-red-400 font-bold">{u.violation_count}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {isTempBanned ? (
                          <span className="text-purple-400 font-bold">
                            {new Date(u.temp_ban_until!).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-[var(--text-3)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-brand tabular-nums">
                        {Number(u.total_xp ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--text-3)]">Use Participants page</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent violations */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h2 className="font-bold text-sm text-[var(--text-1)]">Recent Violations (last 100)</h2>
        </div>
        {(recentViolations?.length ?? 0) === 0 ? (
          <div className="py-10 text-center text-[var(--text-3)] text-sm">No violations recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-3)]">
                  {["User", "Type", "Event", "Warnings", "Disqualified", "When"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentViolations?.map(v => (
                  <tr key={v.id} className={`hover:bg-[var(--bg-3)] transition-colors ${v.is_disqualified ? "bg-red-500/5" : ""}`}>
                    <td className="px-4 py-2 font-semibold text-[var(--text-1)]">
                      @{usernameMap[v.user_id] ?? v.user_id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-2 text-[var(--text-3)] capitalize">{v.session_type}</td>
                    <td className="px-4 py-2">
                      <span className={`font-semibold ${eventColor[v.event_type] ?? "text-[var(--text-2)]"}`}>
                        {v.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-orange-400 font-bold">{v.warning_count}</td>
                    <td className="px-4 py-2 text-center">
                      {v.is_disqualified ? (
                        <span className="text-red-400 font-bold text-xs">YES</span>
                      ) : (
                        <span className="text-[var(--text-3)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-[var(--text-3)] whitespace-nowrap">
                      {new Date(v.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moderation action log */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h2 className="font-bold text-sm text-[var(--text-1)]">Moderation Action Log</h2>
        </div>
        {(modLogs?.length ?? 0) === 0 ? (
          <div className="py-10 text-center text-[var(--text-3)] text-sm">No moderation actions recorded.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {modLogs?.map(log => {
              const target = log.target as { username?: string; full_name?: string } | null;
              return (
                <div key={log.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--text-1)]">
                      {target?.full_name ?? target?.username ?? "Unknown"}
                      <span className="text-[var(--text-3)] font-normal ml-1 text-xs">
                        @{target?.username}
                      </span>
                    </div>
                    {log.reason && (
                      <div className="text-xs text-[var(--text-3)] mt-0.5">{log.reason}</div>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                    log.action === "ban"          ? "text-red-400 border-red-400/30 bg-red-400/10" :
                    log.action === "unban"        ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" :
                    log.action === "warn"         ? "text-orange-400 border-orange-400/30 bg-orange-400/10" :
                    log.action === "reset_xp"     ? "text-amber-400 border-amber-400/30 bg-amber-400/10" :
                    "text-[var(--text-3)] border-[var(--border)] bg-[var(--bg-3)]"
                  }`}>
                    {log.action.replace("_", " ")}
                  </span>
                  <span className="text-xs text-[var(--text-3)] flex-shrink-0 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
