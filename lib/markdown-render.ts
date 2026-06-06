/** Strip markdown to a single preview line */
export function stripMarkdown(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`-]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

/** Simple markdown → HTML for read views (headings, bold, lists, links) */
export function renderMarkdown(text: string | undefined): string {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^### (.+)$/gm, "<h3 class=\"text-sm font-semibold mt-3 mb-1\">$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2 class=\"text-base font-semibold mt-4 mb-1\">$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1 class=\"text-lg font-semibold mt-4 mb-2\">$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    "<a href=\"$2\" class=\"underline text-foreground/80 hover:text-foreground\">$1</a>",
  );
  html = html.replace(/^- (.+)$/gm, "<li class=\"ml-4 list-disc\">$1</li>");
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (m) => `<ul class="my-2 space-y-1">${m}</ul>`);
  html = html.replace(/\n\n/g, "</p><p class=\"my-2\">");
  html = html.replace(/\n/g, "<br />");
  return `<p class="my-2">${html}</p>`;
}
