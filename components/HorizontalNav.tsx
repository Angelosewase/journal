"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  Plus,
  Sun,
  Moon,
  TrendingUp,
  Bell,
  User,
  Menu,
  Computer,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Today", icon: Calendar },
  { href: "/trades", label: "Trade Log", icon: ClipboardList },
  { href: "/weekly", label: "Weekly", icon: BarChart3 },
  { href: "/statistics", label: "Statistics", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function HorizontalNav() {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  return (
    <header className="w-full flex justify-center px-6 pt-4 pb-2 sticky top-0 z-50">
      <div className="w-full ">
        <div className="flex items-center justify-between  ">
          {/* Left — Logo */}
          <div className="flex items-center  pl-2 shrink-0">
            {/* Avatar */}
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
              <User className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </button>

            {/* Bell notification */}
            <button className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative">
              <Bell className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-zinc-900" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-zinc-500" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-400" />
                  <span className="sr-only">
                 
                    Toggle theme
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="rounded-lg cursor-pointer"
                >
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="rounded-lg cursor-pointer"
                >
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="rounded-lg cursor-pointer"
                >
                  
                  <Computer className="mr-2 h-4 w-4"/>

                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1   h-11  rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex items-center gap-1.5 h-10 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-white dark:text-white shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-700/60"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>

            {/* Right — Actions */}
            <div className="flex items-center gap-1.5 pr-1 shrink-0">
              {/* Add Trade */}
              <Link href="/trades/new" className="hidden sm:block">
                <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-primary  text-white text-sm font-medium shadow-sm transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Trade</span>
                </button>
              </Link>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <Menu className="h-4 w-4 text-zinc-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <DropdownMenuItem
                          className={`gap-2 rounded-lg cursor-pointer ${
                            isActive ? "bg-zinc-100 dark:bg-zinc-800" : ""
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}
                  <DropdownMenuItem className="rounded-lg border-t border-zinc-200 dark:border-zinc-800 mt-2">
                    <Link
                      href="/trades/new"
                      className="flex items-center gap-2 w-full"
                    >
                      <Plus className="h-4 w-4" />
                      Add Trade
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
