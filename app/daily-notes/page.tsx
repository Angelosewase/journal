"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
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
  ChevronDown,
  ChevronUp,
  Save,
  Pencil,
  Trash2,
  FileText,
  List,
} from "lucide-react";
import { toast } from "sonner";

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

export default function DailyNotesPage() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [screenshots, setScreenshots] = useState<Id<"_storage">[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isNotesListOpen, setIsNotesListOpen] = useState(false);

  const allNotes = useQuery(api.dailyNotes.list);
  const existingNote = useQuery(api.dailyNotes.getByDate, {
    date: selectedDate,
  });
  const createNote = useMutation(api.dailyNotes.create);
  const updateNote = useMutation(api.dailyNotes.update);
  const removeNote = useMutation(api.dailyNotes.remove);

  useEffect(() => {
    if (existingNote) {
      setNotes(existingNote.notes);
      setScreenshots(existingNote.screenshots || []);
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

    try {
      if (existingNote) {
        await updateNote({
          id: existingNote._id,
          notes: notes.trim(),
          screenshots: screenshots.length > 0 ? screenshots : undefined,
        });
        toast.success("Notes updated");
      } else {
        await createNote({
          date: selectedDate,
          notes: notes.trim(),
          screenshots: screenshots.length > 0 ? screenshots : undefined,
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

  const hasContent = existingNote || isEditing;

  const formatNoteDate = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 pb-16 flex gap-6">
        {/* Collapsible Notes List Sidebar */}

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header with date navigation */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Daily Notes
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                Capture your daily observations and market context
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-500" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 text-zinc-800 dark:text-zinc-200"
              />
              <button
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>
              {selectedDate !== getToday() && (
                <button
                  onClick={() => setSelectedDate(getToday())}
                  className="h-9 px-3 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
                >
                  Today
                </button>
              )}
            </div>
          </div>

          {/* Date label */}
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {formatDate(selectedDate)}
          </p>

          {/* Content */}
          {!hasContent && !isEditing ? (
            /* Empty state */
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-400">
                  No notes for {formatDate(selectedDate)}
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Add Notes
                </Button>
              </div>
            </div>
          ) : isEditing ? (
            /* Edit mode */
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 space-y-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                  Notes
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened today? Market observations, lessons learned, what to watch tomorrow..."
                  rows={8}
                  className="rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
                />
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

              <ScreenshotUpload
                value={screenshots}
                onChange={setScreenshots}
                maxFiles={10}
              />

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (existingNote) {
                      setNotes(existingNote.notes);
                      setScreenshots(existingNote.screenshots || []);
                    } else {
                      setNotes("");
                      setScreenshots([]);
                    }
                  }}
                  className="rounded-full border-zinc-200 dark:border-zinc-700 text-xs"
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  {existingNote && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="rounded-full text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {existingNote ? "Update Notes" : "Save Notes"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Notes
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {existingNote?.notes}
              </p>

              {existingNote?.screenshots &&
                existingNote.screenshots.length > 0 && (
                  <>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                    <ScreenshotGallery storageIds={existingNote.screenshots} />
                  </>
                )}

              <div className="pt-2">
                <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
                  Last updated{" "}
                  {new Date(existingNote!.updatedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Delete confirmation */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Delete Notes</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the notes for{" "}
                  {formatDate(selectedDate)}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="rounded-full"
                >
                  Delete Notes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="shrink-0">
          <button
            onClick={() => setIsNotesListOpen(!isNotesListOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
          >
            <List className="h-4 w-4" />
            {isNotesListOpen &&<span>All Notes</span>}
            {isNotesListOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isNotesListOpen && allNotes && allNotes.length > 0 && (
            <div className="mt-2 w-56 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {allNotes.map((note) => (
                  <button
                    key={note._id}
                    onClick={() => {
                      setSelectedDate(note.date);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-50 dark:border-zinc-800 last:border-0 ${
                      selectedDate === note.date
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    <div className="font-medium">
                      {formatNoteDate(note.date)}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {note.notes.slice(0, 50)}
                      {note.notes.length > 50 ? "..." : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
