"use client";

import { usePathname } from "next/navigation";
import { HorizontalNav } from "@/components/HorizontalNav";
import AppLayout from "./layout/AppLayout";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AppLayout>
      {/* {!isLoginPage && <HorizontalNav />} */}
      <main className="flex-1 mx-auto">
        {children}
      </main>
    </AppLayout>

  );
}
