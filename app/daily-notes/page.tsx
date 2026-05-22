"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Calendar,
  X,
  ArrowLeft,
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

export default function DailyNotesPage() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [screenshots, setScreenshots] = useState<Id<"_storage">[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredNotes = useMemo(() => {
    if (!allNotes) return [];
    return allNotes.filter((note) => {
      const dateMatch = formatDate(note.date).toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = note.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return dateMatch || contentMatch;
    });
  }, [allNotes, searchQuery]);

  const handleNewNote = () => {
    const today = getToday();
    setSelectedDate(today);
    setIsEditing(true);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar - Note List */}
      <div className="w-80 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Journal
            </h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNewNote}
              className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
          {allNotes === undefined ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note._id}
                onClick={() => setSelectedDate(note.date)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all group relative",
                  selectedDate === note.date
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-transparent"
                )}
              >
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-0.5">
                    {new Date(note.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-[14px] font-bold leading-tight">
                    {new Date(note.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <p className="text-xs line-clamp-1 opacity-70 mt-0.5">
                    {note.notes || "No content"}
                  </p>
                </div>
                {selectedDate === note.date && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                {formatDate(selectedDate)}
              </h2>
              {existingNote && (
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  <Clock className="h-2.5 w-2.5" />
                  Updated {new Date(existingNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full px-4 h-8 text-xs font-semibold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <Pencil className="h-3 w-3 mr-1.5" />
                  Edit
                </Button>
                {existingNote && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-500/10 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
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
                  className="rounded-full px-4 h-8 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="rounded-full px-6 h-8 bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold gap-1.5 shadow-sm shadow-primary/10"
                >
                  <Save className="h-3 w-3" />
                  Save Changes
                </Button>
              </div>
            )}
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 text-[11px] font-bold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 text-zinc-600 dark:text-zinc-400 outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </header>

        {/* Note Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
            {isEditing ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Content</span>
                  </div>
                  <RichTextEditor
                    value={notes}
                    onChange={setNotes}
                    placeholder="Capture your thoughts, analysis, and market observations..."
                    className="min-h-[400px] border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all rounded-2xl"
                    rows={20}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Attachments</span>
                  </div>
                  <div className="p-1">
                    <ScreenshotUpload
                      value={screenshots}
                      onChange={setScreenshots}
                      maxFiles={10}
                    />
                  </div>
                </div>
              </div>
            ) : !existingNote ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">No notes for this date</h3>
                <p className="max-w-xs text-sm text-zinc-500 mb-8 leading-relaxed">
                  Every day is an opportunity to learn. Capture your market context and observations.
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-primary hover:opacity-90 text-primary-foreground px-8 h-10 font-bold shadow-md shadow-primary/10 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  {notes ? (
                    <div className="markdown-content text-zinc-800 dark:text-zinc-200 leading-relaxed text-base">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-5 mt-2 space-y-1" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-5 mt-2 space-y-1" {...props} />,
                          li: ({ ...props }) => <li className="mb-1" {...props} />,
                          p: ({ ...props }) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-primary/50 pl-4 italic text-zinc-500 my-6" {...props} />
                          ),
                          code: ({ ...props }) => (
                            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                          ),
                        }}
                      >
                        {notes}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic">This note has no text content.</p>
                  )}
                </div>

                {existingNote?.screenshots && existingNote.screenshots.length > 0 && (
                  <div className="space-y-6 pt-10 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Attachments</h4>
                    </div>
                    <ScreenshotGallery storageIds={existingNote.screenshots} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete confirmation */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent showCloseButton={false} className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
            <div className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Delete Note?</DialogTitle>
                <DialogDescription className="text-zinc-500 dark:text-zinc-400 pt-2 leading-relaxed">
                  Are you sure you want to delete the notes for <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatDate(selectedDate)}</span>? This action is permanent and cannot be undone.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
                className="rounded-full px-6 text-sm font-semibold"
              >
                Keep Note
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="rounded-full px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/20"
              >
                Delete Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(161, 161, 170, 0.2);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(63, 63, 70, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(161, 161, 170, 0.4);
        }
        
        .markdown-content p {
          margin-bottom: 1.25rem;
        }
      `}</style>
    </div>
  );
}
