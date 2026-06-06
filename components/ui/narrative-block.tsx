import { renderMarkdown } from "@/lib/markdown-render";
import { cn } from "@/lib/utils";

type NarrativeBlockProps = Readonly<{
  title?: string;
  content?: string;
  variant?: "default" | "callout";
  className?: string;
}>;

export function NarrativeBlock({
  title,
  content,
  variant = "default",
  className,
}: NarrativeBlockProps) {
  if (!content?.trim()) return null;

  return (
    <div
      className={cn(
        "rounded-lg text-sm leading-relaxed text-foreground/90",
        variant === "callout" && "border-l-2 border-border pl-4 py-1",
        variant === "default" && "py-1",
        className,
      )}
    >
      {title && (
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      )}
      <div
        className="prose-sm max-w-none [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
