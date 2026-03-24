"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, ChevronRight, ArrowLeft, BookOpen, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type StrategyFile = {
  name: string;
  slug: string;
};

function formatSlug(slug: string): string {
  return slug
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 mt-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 mt-8 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mt-6 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-800 dark:text-zinc-100">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-zinc-600 dark:text-zinc-300">
      {children}
    </em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1.5 mb-4 text-sm text-zinc-600 dark:text-zinc-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1.5 mb-4 text-sm text-zinc-600 dark:text-zinc-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-emerald-500 pl-4 my-4 text-sm text-zinc-500 dark:text-zinc-400 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-700 dark:text-zinc-300 font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 my-4 overflow-x-auto text-xs font-mono text-zinc-700 dark:text-zinc-300">
      {children}
    </pre>
  ),
  hr: () => (
    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-6" />
  ),
  table: ({ children }) => (
    <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 my-4">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-50 dark:bg-zinc-800/60">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-left px-4 py-3">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800">
      {children}
    </td>
  ),
};

export function StrategyViewer() {
  const [files, setFiles] = useState<StrategyFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchFiles = useCallback(() => {
    fetch("/api/strategies")
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const loadFile = useCallback(async (fileName: string) => {
    setContentLoading(true);
    try {
      const res = await fetch(`/api/strategies?file=${encodeURIComponent(fileName)}`);
      const data = await res.json();
      setContent(data.content ?? "");
      setSelectedFile(fileName);
    } catch {
      setContent("Failed to load strategy document.");
    } finally {
      setContentLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a .md file");
      return;
    }

    setSaving(true);
    try {
      const fileContent = await uploadedFile.text();
      const title = uploadedFile.name.replace(/\.md$/i, "");

      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: fileContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save");
      }

      toast.success("Strategy saved!");
      setDialogOpen(false);
      setUploadedFile(null);
      fetchFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save strategy");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-zinc-300 dark:text-zinc-600 animate-pulse" />
          </div>
          <p className="text-sm text-zinc-400">Loading strategies...</p>
        </div>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedFile(null);
            setContent("");
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to strategies
        </button>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
          {contentLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-zinc-300 dark:text-zinc-600 animate-pulse" />
              </div>
              <p className="text-sm text-zinc-400">Loading document...</p>
            </div>
          ) : (
            <div>
              <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Strategy Documents
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
              {files.length} document{files.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Strategy
          </button>
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400">No strategy documents yet</p>
            <button
              onClick={() => setDialogOpen(true)}
              className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-semibold transition-colors"
            >
              Upload Your First Strategy
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => loadFile(file.name)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left group"
              >
                <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                    {formatSlug(file.slug)}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5">
                    {file.name}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Strategy</DialogTitle>
            <DialogDescription>
              Upload a Markdown file. The filename will be used as the strategy name.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label
              htmlFor="strategy-upload"
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-8 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Upload className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              </div>
              {uploadedFile ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {uploadedFile.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    {(uploadedFile.size / 1024).toFixed(1)} KB — click to replace
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    Click to upload a .md file
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    Markdown files only
                  </p>
                </div>
              )}
            </label>
            <input
              id="strategy-upload"
              type="file"
              accept=".md,.markdown"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadedFile(file);
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setUploadedFile(null);
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !uploadedFile}
              className="rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              {saving ? "Saving..." : "Save Strategy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
