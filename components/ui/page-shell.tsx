import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = Readonly<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  children: ReactNode;
}>;

const maxWidthClass = {
  sm: "max-w-6xl",
  md: "max-w-2xl",
  lg: "max-w-6xl",
  xl: "max-w-6xl",
  "2xl": "max-w-6xl",
  full: "max-w-none",
};

export function PageShell({
  title,
  subtitle,
  actions,
  maxWidth = "2xl",
  children,
}: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full space-y-6 pb-16 px-6 py-8", maxWidthClass[maxWidth])}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function SectionHeading({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{children}</p>
  );
}

export function CategoryLabel({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function StatInline({
  label,
  value,
  hint,
  valueClassName,
}: Readonly<{
  label: string;
  value: ReactNode;
  hint?: string;
  valueClassName?: string;
}>) {
  return (
    <div className="flex flex-col">
      <CategoryLabel className="mb-2">{label}</CategoryLabel>
      <span className={cn("text-2xl font-bold leading-none tabular-nums text-zinc-900 dark:text-zinc-50", valueClassName)}>
        {value}
      </span>
      {hint && (
        <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">{hint}</p>
      )}
    </div>
  );
}

export function MiniBar({
  value,
  max,
  color = "bg-emerald-500",
}: Readonly<{ value: number; max: number; color?: string }>) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyPlaceholder({
  message = "No screenshot",
  className,
}: Readonly<{ message?: string; className?: string }>) {
  return (
    <div
      className={cn(
        "flex aspect-video items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500",
        className,
      )}
    >
      {message}
    </div>
  );
}
