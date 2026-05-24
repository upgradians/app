import Link from "next/link";
import { cn } from "@upgradian/ui";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  compact?: boolean;
  className?: string;
}

export function EmptyState({ icon = "📭", title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center", compact ? "py-8 px-4" : "py-16 px-6", className)}>
      <div className={cn("opacity-50", compact ? "text-3xl mb-2" : "text-5xl mb-4")}>{icon}</div>
      <h3 className="font-bold text-[var(--text-1)] text-sm mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--text-3)] mb-4 max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-all duration-200 active:scale-95"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
