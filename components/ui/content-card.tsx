import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentCardProps = Readonly<{
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}>;

export function ContentCard({ children, className, padding = "md" }: ContentCardProps) {
  const pad = { sm: "p-3", md: "p-4", lg: "p-6" }[padding];
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card shadow-sm",
        pad,
        className,
      )}
    >
      {children}
    </div>
  );
}
