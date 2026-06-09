"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScreenshotUpload, type ScreenshotItem } from "@/components/ScreenshotUpload";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { NarrativeBlock } from "@/components/ui/narrative-block";
import { ContentCard } from "@/components/ui/content-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Save,
  Pencil,
  Trash2,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function toScreenshotItems(ids: Id<"_storage">[] | undefined): ScreenshotItem[] {
  return (ids ?? []).map((storageId) => ({ storageId }));
}

function toStorageIds(items: ScreenshotItem[]): Id<"_storage">[] {
  return items.map((item) => item.storageId);
}

export function DailyNotesContent() {
  const searchParams = useSearchParams();
  const dateFromUrl = searchParams.get("date");

  const [selectedDate, setSelectedDate] = useState(dateFromUrl ?? getToday());
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allNotes = useQuery(api.dailyNotes.list);
  const existingNote = useQuery(api.dailyNotes.getByDate, { date: selectedDate });
  const createNote = useMutation(api.dailyNotes.create);
  const updateNote = useMutation(api.dailyNotes.update);
  const removeNote = useMutation(api.dailyNotes.remove);

  useEffect(() => {
    if (dateFromUrl && dateFromUrl !== selectedDate) {
      setSelectedDate(dateFromUrl);
    }
  }, [dateFromUrl, selectedDate]);

  useEffect(() => {
    if (existingNote) {
      setNotes(existingNote.notes);
      setScreenshots(toScreenshotItems(existingNote.screenshots));
    } else {
      setNotes("");
      setScreenshots([]);
    }
    setIsEditing(false);
  }, [existingNote, selectedDate]);

  const handleSave = async () => {
    if (!notes.trim() && screenshots.length === 0) {
      toast.error("Add some notes or screenshots first");
      return;
    }

    const storageIds = toStorageIds(screenshots);

    try {
      if (existingNote) {
        await updateNote({
          id: existingNote._id,
          notes: notes.trim(),
          screenshots: storageIds.length > 0 ? storageIds : undefined,
        });
        toast.success("Notes updated");
      } else {
        await createNote({
          date: selectedDate,
          notes: notes.trim(),
          screenshots: storageIds.length > 0 ? storageIds : undefined,
        });
        toast.success("Notes saved");
      }
      setIsEditing(false);
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const handleDelete = async () => {
    if (!existingNote) return;
    try {
      await removeNote({ id: existingNote._id });
      toast.success("Notes deleted");
      setNotes("");
      setScreenshots([]);
      setIsEditing(false);
      setShowDeleteDialog(false);
    } catch {
      toast.error("Failed to delete notes");
    }
  };

  const filteredNotes = useMemo(() => {
    if (!allNotes) return [];
    const q = searchQuery.toLowerCase();
    if (!q) return allNotes;
    return allNotes.filter((note) => {
      const dateMatch = formatDate(note.date).toLowerCase().includes(q);
      const contentMatch = note.notes.toLowerCase().includes(q);
      return dateMatch || contentMatch;
    });
  }, [allNotes, searchQuery]);

  const handleNewNote = () => {
    setSelectedDate(getToday());
    setIsEditing(true);
  };

  const resetDraft = () => {
    setIsEditing(false);
    if (existingNote) {
      setNotes(existingNote.notes);
      setScreenshots(toScreenshotItems(existingNote.screenshots));
    } else {
      setNotes("");
      setScreenshots([]);cle
    }
  };

  return (
    <div className="-m-4 flex min-h-[calc(100vh-3rem)] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar — note list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:w-80 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Daily Notes
            </h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNewNote}
              className="h-8 w-8 rounded-md"
              aria-label="New note"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-none bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-zinc-400 focus:ring-1 focus:ring-emerald-500/40 dark:bg-zinc-800"
            />
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {allNotes === undefined ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <FileText className="mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm text-zinc-500">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note._id}
                type="button"
                onClick={() => setSelectedDate(note.date)}
                className={cn(
                  "relative w-full rounded-xl border p-3 text-left transition-all",
                  selectedDate === note.date
                    ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-900 dark:text-zinc-50"
                    : "border-transparent text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60",
                )}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {new Date(note.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-sm font-semibold leading-tight">
                  {new Date(note.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs opacity-70">
                  {note.notes || "No content"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main editor */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-zinc-100 px-4 dark:border-zinc-800 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                className="h-8 w-8 rounded-md"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                className="h-8 w-8 rounded-md"
                aria-label="Next day"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {formatDate(selectedDate)}
              </h2>
              {existingNote && (
                <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                  <Clock className="h-2.5 w-2.5" />
                  Updated{" "}
                  {new Date(existingNote.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-md">
                  <Pencil className="mr-1.5 h-3 w-3" />
                  Edit
                </Button>
                {existingNote && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-8 w-8 rounded-md text-zinc-400 hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={resetDraft} className="rounded-md">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} className="rounded-md">
                  <Save className="mr-1.5 h-3 w-3" />
                  Save
                </Button>
              </>
            )}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 rounded-md border border-zinc-100 bg-zinc-50 px-2 text-[11px] font-medium text-zinc-600 outline-none focus:ring-1 focus:ring-emerald-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
            {isEditing ? (
              <>
                <ContentCard>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Content
                  </p>
                  <RichTextEditor
                    value={notes}
                    onChange={setNotes}
                    placeholder="Capture your thoughts, analysis, and market observations…"
                    className="min-h-[360px] rounded-xl border-zinc-100 dark:border-zinc-800"
                    rows={18}
                  />
                </ContentCard>
                <ContentCard>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Attachments
                  </p>
                  <ScreenshotUpload
                    value={screenshots}
                    onChange={setScreenshots}
                    maxFiles={10}
                    enablePaste
                  />
                </ContentCard>
              </>
            ) : !existingNote ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
                  <FileText className="h-7 w-7 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  No notes for this date
                </h3>
                <p className="mb-8 max-w-xs text-sm leading-relaxed text-zinc-500">
                  Capture market context, observations, and anything you want to remember about this day.
                </p>
                <Button onClick={() => setIsEditing(true)} className="rounded-md">
                  <Plus className="mr-2 h-4 w-4" />
                  Create note
                </Button>
              </div>
            ) : (
              <>
                <NarrativeBlock content={notes || undefined} variant="default" />
                {!notes?.trim() && (
                  <p className="text-sm italic text-zinc-500">This note has no text content.</p>
                )}
                {existingNote.screenshots && existingNote.screenshots.length > 0 && (
                  <ContentCard>
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Attachments
                    </p>
                    <ScreenshotGallery storageIds={existingNote.screenshots} />
                  </ContentCard>
                )}
              </>
            )}
          </div>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete note?</DialogTitle>
              <DialogDescription>
                Delete notes for {formatDate(selectedDate)}? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
                Keep note
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
