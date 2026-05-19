"use client";

import * as React from "react";
import {
  Calendar,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Settings,
  StickyNote,
  Wallet,
} from "lucide-react";

import { TrendingUp } from "lucide-react";
import { NavMain } from "@/components/ui/nav-main";
import { NavUser } from "@/components/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
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
      title: "Notes",
      url: "/daily-notes",
      icon: StickyNote,
    },
    {
      title: "Weekly",
      url: "/weekly",
      icon: BarChart3,
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { user } = useAuthContext();

  // Transform user data to match NavUser component's expected format
  // const userData = user
  //   ? {
  //       name: `${user.firstName} ${user.lastName}`.trim(),
  //       email: user.email,
  //       avatar: "", // Will use initials fallback
  //     }
  //   : null;

  return (
    <Sidebar variant="floating" collapsible="icon" {...props} className=" mr-2">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser/>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
    </Sidebar>
  );
}
