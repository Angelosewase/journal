"use client";

import { type FC, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: FC<ToolbarButtonProps> = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={cn(
      "p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors",
      active && "bg-zinc-200 dark:bg-zinc-600"
    )}
  >
    {children}
  </button>
);

function insertMarkdown(text: string, selectionStart: number, selectionEnd: number, prefix: string, suffix: string = ""): { newText: string; newCursorStart: number; newCursorEnd: number } {
  const before = text.slice(0, selectionStart);
  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);

  if (selected) {
    const newText = before + prefix + selected + suffix + after;
    return {
      newText,
      newCursorStart: selectionStart + prefix.length,
      newCursorEnd: selectionEnd + prefix.length
    };
  } else {
    const newText = before + prefix + suffix + after;
    return {
      newText,
      newCursorStart: selectionStart + prefix.length,
      newCursorEnd: selectionStart + prefix.length
    };
  }
}

function insertLinePrefix(text: string, selectionStart: number, lineStart: number, prefix: string): { newText: string; newCursorStart: number } {
  const before = text.slice(0, lineStart);
  const line = text.slice(lineStart, selectionStart);
  const after = text.slice(selectionStart);

  const newLine = prefix + line;
  const newText = before + newLine + after;

  return {
    newText,
    newCursorStart: selectionStart + prefix.length
  };
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback((prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const { newText, newCursorStart, newCursorEnd } = insertMarkdown(
      value,
      start,
      end,
      prefix,
      suffix
    );

    onChange(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    });
  }, [value, onChange]);

  const toggleBold = useCallback(() => applyFormat("**", "**"), [applyFormat]);
  const toggleItalic = useCallback(() => applyFormat("*", "*"), [applyFormat]);
  const toggleUnderline = useCallback(() => applyFormat("__", "__"), [applyFormat]);
  const toggleBullet = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;

    const { newText, newCursorStart } = insertLinePrefix(value, start, lineStart, "- ");
    onChange(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorStart);
    });
  }, [value, onChange]);

  const toggleNumbered = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;

    const { newText, newCursorStart } = insertLinePrefix(value, start, lineStart, "1. ");
    onChange(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorStart);
    });
  }, [value, onChange]);

  const insertHeading = useCallback(() => applyFormat("## "), [applyFormat]);
  const insertQuote = useCallback(() => applyFormat("> "), [applyFormat]);

  return (
    <div className={cn("border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-800", className)}>
      <div className="flex items-center gap-0.5 p-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex-wrap">
        <ToolbarButton onClick={toggleBold} title="Bold (Ctrl+B)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={toggleItalic} title="Italic (Ctrl+I)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 4h-9M14 20H5M15 4L9 20" />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={toggleUnderline} title="Underline (Ctrl+U)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-600 mx-1" />

        <ToolbarButton onClick={toggleBullet} title="Bullet List">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={toggleNumbered} title="Numbered List">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-600 mx-1" />

        <ToolbarButton onClick={insertHeading} title="Heading">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={insertQuote} title="Quote">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
          </svg>
        </ToolbarButton>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none resize-none text-sm"
      />
    </div>
  );
};