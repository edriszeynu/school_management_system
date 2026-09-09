"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  LayoutDashboardIcon,
  UsersIcon,
  UserCheckIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  CreditCardIcon,
  FileBarChartIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  GraduationCap,
} from "lucide-react";

const navMainItems = [
  { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
  { title: "Students", url: "/dashboard/students", icon: <UsersIcon /> },
  { title: "Teachers", url: "/dashboard/teachers", icon: <UserCheckIcon /> },
  { title: "Classes", url: "/dashboard/classes", icon: <BookOpenIcon /> },
  { title: "Attendance", url: "/dashboard/attendance", icon: <CalendarCheckIcon /> },
  { title: "Fees & Finance", url: "/dashboard/fees", icon: <CreditCardIcon /> },
  { title: "Reports", url: "/dashboard/reports", icon: <FileBarChartIcon /> },
];

const navSecondaryItems = [
  { title: "Settings", url: "/dashboard/settings", icon: <Settings2Icon /> },
  { title: "Get Help", url: "/dashboard/help", icon: <CircleHelpIcon /> },
  { title: "Search", url: "/dashboard/search", icon: <SearchIcon /> },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const user = {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@school.com",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/dashboard" />}
            >
              <GraduationCap className="size-5!" />
              <span className="text-base font-semibold">SchoolPro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}