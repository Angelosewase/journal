import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentCardProps = Readonly<{
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}>;

export function ContentCard({ children, className, padding = "lg" }: ContentCardProps) {
  const pad = { none: "", sm: "p-4", md: "p-5", lg: "p-6" }[padding];
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        pad,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InsetRow({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div className={cn("rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50", className)}>
      {children}
    </div>
  );
}

export function PanelDivider() {
  return <div className="h-px bg-zinc-100 dark:bg-zinc-800" />;
}
