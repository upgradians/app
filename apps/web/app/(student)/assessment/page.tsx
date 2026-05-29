import type { Metadata } from "next";
import Link from "next/link";
import { ASSESSMENT_TRACKS } from "@/lib/assessment-questions";

export const metadata: Metadata = { title: "Assessment Centre | Upgradian" };

const TRACK_ICONS: Record<string, string> = {
  "aptitude":             "🧮",
  "digital-marketing":    "📣",
  "data-science":         "📊",
  "data-analyst":         "🔍",
  "full-stack-developer": "🖥️",
  "python-developer":     "🐍",
  "medical-coding":       "🏥",
  "ai-ds":                "🤖",
  "frontend-developer":   "🎨",
  "backend-developer":    "⚙️",
  "ai-product-developer": "💡",
  "software-developer":   "💻",
  "testing-qa":           "🧪",
  "cyber-security":       "🛡️",
};

export default function AssessmentPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Assessment Centre</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Select your track. The test is proctored — camera, microphone, and full-screen are required.
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
        <span className="text-lg mt-0.5">⚠️</span>
        <div className="text-sm text-orange-800">
          <p className="font-semibold mb-0.5">Proctoring requirements</p>
          <p className="text-orange-700 text-xs leading-relaxed">
            This assessment requires <strong>camera access</strong>, <strong>microphone access</strong>, and must be taken in <strong>full-screen mode</strong>.
            Exiting full-screen, switching tabs, or excessive background noise will trigger warnings.
            Three noise violations will result in automatic disqualification.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ASSESSMENT_TRACKS.map(track => (
          <Link
            key={track.slug}
            href={`/assessment/${track.slug}`}
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-orange-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{TRACK_ICONS[track.slug] ?? "📋"}</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                {track.duration} min
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{track.label}</h3>
            <p className="text-xs text-gray-500">{track.questions.length} questions · MCQ format</p>
            <div className="mt-4 text-xs font-semibold text-orange-500 group-hover:text-orange-600 transition-colors">
              Start Assessment →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
