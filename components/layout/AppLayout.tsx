"use client";

import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wallet,
  CalendarDays,
  ClipboardList,
  StickyNote,
  BarChart3,
  TrendingUp,
  Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Navigation items matching sidebar structure
const navigationItems = [
   {
      title: "Today",
      url: "/",
      icon: Calendar,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: Wallet,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "Trade Log",
      url: "/trades",
      icon: ClipboardList,
    },
    {
      title: "Daily Notes",
      url: "/daily-notes",
      icon: StickyNote,
    },
    {
      title: "Planning",
      url: "/weekly",
      icon: BarChart3 ,
    },
    {
      title: "Statistics",
      url: "/statistics",
      icon: TrendingUp,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
];

// Function to generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  // Map route segments to readable labels
  const routeLabels: Record<string, string> = {
    "": "Today",
    accounts: "Accounts",
    calendar: "Calendar",
    trades: "Trade Log",
    "daily-notes": "Daily Notes",
    "daily-bias": "Daily Bias",
    weekly: "Planning",
    gameplan: "Pre-Gameplan",
    review: "Review",
    statistics: "Statistics",
    settings: "Settings",
    login: "Login",
    new: "New",
  };

  // Root path should point to Journal
  if (pathname === "/") {
    breadcrumbs.push({ label: "Journal", href: "/" });
    return breadcrumbs;
  }

  breadcrumbs.push({ label: "Journal", href: "/" });

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label =
      routeLabels[segment] ||
      segment.replace(/-/g, " ").replace(/\b\w/g, (match) =>
        match.toUpperCase(),
      );

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Start with 1 on both server and client so SSR and hydration agree,
  // then sync to the real history length after mount.
  const [historyLength, setHistoryLength] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser history length on mount
    setHistoryLength(window.history.length);

    const handlePopState = () => {
      setHistoryLength(window.history.length);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleForward = () => {
    router.forward();
  };

  // Enable buttons if there's history to navigate
  // Note: This is an approximation - actual history state is browser-managed
  const canGoBack = historyLength > 1;
  const canGoForward = true;
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className=" shadow-none bg-zinc-50 dark:bg-zinc-950 overflow-x-auto ">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4 ">
            <div className="flex items-center gap-2 flex-1">
              <SidebarTrigger className="-ml-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center">
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className="font-medium text-foreground">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={crumb.href}
                            className="text-muted-foreground"
                            asChild
                          >
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>


            <div className="flex items-center">
              {/* Navigation arrows */}
              <Button
                variant="ghost"
                size="sm"
                className="p-0"
                onClick={handleBack}
                disabled={!canGoBack}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="p-0"
                onClick={handleForward}
                disabled={!canGoForward}
              >
                <ChevronRight />
              </Button>
            </div>
            {/* <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
                New Tab
              </Button>


              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Star className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Share className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Move to folder</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
          </header>
          <div className="p-4 w-full h-full">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
