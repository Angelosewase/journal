import { renderMarkdown } from "@/lib/markdown-render";
import { cn } from "@/lib/utils";
import { CategoryLabel } from "@/components/ui/page-shell";

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
        "rounded-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300",
        variant === "callout" && "border-l-2 border-zinc-200 pl-4 py-1 dark:border-zinc-700",
        variant === "default" && "py-1",
        className,
      )}
    >
      {title && (
        <div className="mb-1.5">
          <CategoryLabel>{title}</CategoryLabel>
        </div>
      )}
      <div
        className="prose-sm max-w-none [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
