import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: recruiter } = await supabase
    .from("recruiters")
    .select("id,is_verified")
    .eq("user_id", user.id)
    .single();

  if (!recruiter) redirect("/recruiter/onboard");

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="flex">
        {/* Recruiter sidebar */}
        <aside className="w-60 min-h-screen border-r border-[var(--border)] bg-[var(--bg-2)] flex flex-col p-4">
          <div className="text-sm font-extrabold text-[var(--text-1)] mb-6 px-2">
            🏢 Recruiter Portal
          </div>
          <nav className="space-y-1 flex-1">
            {[
              { href: "/recruiter/dashboard", icon: "📊", label: "Dashboard" },
              { href: "/recruiter/candidates", icon: "👥", label: "Candidates" },
              { href: "/recruiter/assessments", icon: "📝", label: "Assessments" },
              { href: "/recruiter/jobs",        icon: "💼", label: "Job Postings" },
              { href: "/recruiter/analytics",   icon: "📈", label: "Analytics" },
            ].map(item => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-2)] hover:bg-[var(--bg-3)] hover:text-[var(--text-1)] transition-colors">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
