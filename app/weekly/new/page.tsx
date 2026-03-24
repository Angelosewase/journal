"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function WeeklyNewRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "review";

  useEffect(() => {
    if (type === "fundamental") {
      router.replace("/weekly/fundamental/new");
    } else {
      router.replace("/weekly/review/new");
    }
  }, [type, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
    </div>
  );
}

export default function NewWeeklyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    }>
      <WeeklyNewRedirect />
    </Suspense>
  );
}