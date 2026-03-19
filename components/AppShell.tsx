"use client";

import { usePathname } from "next/navigation";
import { HorizontalNav } from "@/components/HorizontalNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isLoginPage && <HorizontalNav />}
      <main className="flex-1 container py-6 px-4 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
