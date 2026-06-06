import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = Readonly<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}>;

const maxWidthClass = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

export function PageShell({
  title,
  subtitle,
  actions,
  maxWidth = "lg",
  children,
}: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full space-y-6 pb-16", maxWidthClass[maxWidth])}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
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
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</p>
  );
}

export function StatInline({
  label,
  value,
  valueClassName,
}: Readonly<{
  label: string;
  value: ReactNode;
  valueClassName?: string;
}>) {
  return (
    <div className="inline-flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", valueClassName)}>{value}</span>
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
        "flex aspect-video items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 text-xs text-muted-foreground",
        className,
      )}
    >
      {message}
    </div>
  );
}
