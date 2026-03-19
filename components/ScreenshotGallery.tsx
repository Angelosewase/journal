"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ScreenshotGalleryProps {
  storageIds: Id<"_storage">[];
}

function ScreenshotItem({
  storageId,
  index,
  onClick,
}: {
  storageId: Id<"_storage">;
  index: number;
  onClick: () => void;
}) {
  const url = useQuery(api.trades.getStorageUrl, { storageId });

  if (!url) {
    return (
      <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 aspect-video flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-600 animate-pulse" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 aspect-video block cursor-pointer"
    >
      <img
        src={url}
        alt={`Screenshot ${index + 1}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded-full">
          View
        </span>
      </div>
    </button>
  );
}

function ScreenshotViewer({
  storageIds,
  initialIndex,
  onClose,
}: {
  storageIds: Id<"_storage">[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentUrl = useQuery(api.trades.getStorageUrl, {
    storageId: storageIds[currentIndex],
  });

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < storageIds.length - 1;

  const handlePrev = () => {
    if (canPrev) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (canNext) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/70 text-xs font-medium z-10">
        {currentIndex + 1} / {storageIds.length}
      </div>

      {/* Navigation */}
      {canPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[85vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={`Screenshot ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="w-[60vw] h-[60vh] flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-white/30 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ScreenshotGallery({ storageIds }: ScreenshotGalleryProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (!storageIds || storageIds.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
        Screenshots
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {storageIds.map((id, index) => (
          <ScreenshotItem
            key={id}
            storageId={id}
            index={index}
            onClick={() => setViewerIndex(index)}
          />
        ))}
      </div>

      {viewerIndex !== null && (
        <ScreenshotViewer
          storageIds={storageIds}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}
