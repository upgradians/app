"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "student",    label: "Student" },
  { value: "employee",   label: "Employee" },
  { value: "job_seeker", label: "Job Seeker" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner",      label: "Beginner (0–1 yr)" },
  { value: "intermediate",  label: "Intermediate (1–3 yrs)" },
  { value: "experienced",   label: "Experienced (3–5 yrs)" },
  { value: "expert",        label: "Expert (5+ yrs)" },
];

export function RegisterForm() {
  const router = useRouter();

  const [step,         setStep]         = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // Step 1 fields
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");

  // Step 2 fields
  const [phone,        setPhone]        = useState("");
  const [userRole,     setUserRole]     = useState("student");
  const [qualification,setQualification]= useState("");
  const [college,      setCollege]      = useState("");
  const [nationality,  setNationality]  = useState("");
  const [address,      setAddress]      = useState("");
  const [experience,   setExperience]   = useState("beginner");

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200
    bg-white/[0.04] border border-white/[0.09]
    placeholder:text-white/25
    focus:border-brand/60 focus:bg-white/[0.06]
  `;

  const selectClass = `
    w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200
    bg-[#0a0a14] border border-white/[0.09]
    focus:border-brand/60
  `;

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:       name,
          phone_number:    phone,
          user_role:       userRole,
          qualification,
          college,
          nationality,
          address,
          experience_level: experience,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      toast.error(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with extended fields (trigger may not have all fields)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from("profiles")
        .update({
          phone_number:    phone    || null,
          nationality:     nationality || null,
          address:         address  || null,
          qualification:   qualification || null,
          experience_level: experience || null,
          college:         college  || null,
        })
        .eq("id", session.user.id);
      // best effort — ignore errors

      toast.success("Welcome to Upgradian!");
      router.push("/dashboard");
    } else {
      toast.success("Check your email to confirm your account!");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h1>
        <p className="text-sm mt-1.5" style={{ color: "rgba(136,146,176,0.6)" }}>
          Join 50,000+ developers on Upgradian
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? "bg-brand text-white" : "bg-white/10 text-white/40"
              }`}>{s}</div>
              {s < 2 && <div className={`w-8 h-0.5 ${step > s ? "bg-brand" : "bg-white/10"}`} />}
            </div>
          ))}
          <span className="text-xs text-white/40 ml-1">Step {step} of 2</span>
        </div>
      </div>

      {/* Step 1: Credentials */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              Full Name <span className="text-red-400">*</span>
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              required placeholder="Your full name" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              Email <span className="text-red-400">*</span>
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="you@example.com" autoComplete="email" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              Password <span className="text-red-400">*</span>
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8} placeholder="Min. 8 characters" autoComplete="new-password" className={inputClass} />
          </div>

          <button type="submit"
            className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-px active:scale-95 mt-2"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}>
            Continue
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      )}

      {/* Step 2: Profile details */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                required placeholder="+91 9876543210" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
                Nationality <span className="text-red-400">*</span>
              </label>
              <input type="text" value={nationality} onChange={e => setNationality(e.target.value)}
                required placeholder="Indian" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              I am a <span className="text-red-400">*</span>
            </label>
            <select value={userRole} onChange={e => setUserRole(e.target.value)} className={selectClass}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              {userRole === "employee" ? "Company" : "College / Institution"} <span className="text-red-400">*</span>
            </label>
            <input type="text" value={college} onChange={e => setCollege(e.target.value)}
              required placeholder={userRole === "employee" ? "Your company name" : "Your college name"} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              Qualification <span className="text-red-400">*</span>
            </label>
            <input type="text" value={qualification} onChange={e => setQualification(e.target.value)}
              required placeholder="B.Tech CSE / MCA / BCA…" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              Experience Level <span className="text-red-400">*</span>
            </label>
            <select value={experience} onChange={e => setExperience(e.target.value)} className={selectClass}>
              {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(136,146,176,0.7)" }}>
              Address <span className="text-red-400">*</span>
            </label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              required placeholder="City, State, Country" className={inputClass} />
          </div>

          {error && (
            <div className="text-xs rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border border-white/10 text-white/60 hover:bg-white/5">
              ← Back
            </button>
            <button type="submit" disabled={loading}
              className="flex-[2] group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-px active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 0 0 1px rgba(67,97,238,0.4), 0 8px 32px rgba(67,97,238,0.3)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm mt-6" style={{ color: "rgba(136,146,176,0.5)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold transition-colors" style={{ color: "#6c8aff" }}>Sign in</Link>
      </p>
    </div>
  );
}
