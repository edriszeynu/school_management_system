// components/app-sidebar.tsx
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
  ClockIcon,
} from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  // Role-based navigation items
  let navMainItems: { title: string; url: string; icon: React.ReactNode }[] = [];

  if (role === "SUPER_ADMIN" || role === "SCHOOL_ADMIN") {
    navMainItems = [
      { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
      { title: "Users", url: "/dashboard/users", icon: <UsersIcon /> },
      { title: "Students", url: "/dashboard/students", icon: <UsersIcon /> },
      { title: "Teachers", url: "/dashboard/teachers", icon: <UserCheckIcon /> },
      { title: "Classes", url: "/dashboard/classes", icon: <BookOpenIcon /> },
      { title: "Attendance", url: "/dashboard/attendance", icon: <CalendarCheckIcon /> },
      { title: "Fees", url: "/dashboard/fees", icon: <CreditCardIcon /> },
      { title: "Exams", url: "/dashboard/exams", icon: <FileBarChartIcon /> },
      { title: "Fee Structures", url: "/dashboard/fee-structures", icon: <CreditCardIcon /> },
      { title: "Reports", url: "/dashboard/reports", icon: <FileBarChartIcon /> },
    ];
  } else if (role === "TEACHER") {
    navMainItems = [
      { title: "Dashboard",   url: "/dashboard/teacher",            icon: <LayoutDashboardIcon /> },
      { title: "My Classes",  url: "/dashboard/teacher/classes",    icon: <BookOpenIcon /> },
      { title: "Students",    url: "/dashboard/teacher/students",   icon: <UsersIcon /> },
      { title: "Attendance",  url: "/dashboard/teacher/attendance", icon: <CalendarCheckIcon /> },
      { title: "Grades",      url: "/dashboard/teacher/grades",     icon: <FileBarChartIcon /> },
      { title: "Timetable",   url: "/dashboard/teacher/timetable",  icon: <ClockIcon /> },
    ];
  } else if (role === "STUDENT") {
    navMainItems = [
      { title: "Dashboard",   url: "/dashboard/student",            icon: <LayoutDashboardIcon /> },
      { title: "Attendance",  url: "/dashboard/student/attendance", icon: <CalendarCheckIcon /> },
      { title: "My Grades",   url: "/dashboard/student/grades",     icon: <FileBarChartIcon /> },
      { title: "Exams",       url: "/dashboard/student/exams",      icon: <BookOpenIcon /> },
      { title: "Timetable",   url: "/dashboard/student/timetable",  icon: <ClockIcon /> },
      { title: "Fees",        url: "/dashboard/student/fees",       icon: <CreditCardIcon /> },
    ];
  } else if (role === "PARENT") {
    navMainItems = [
      { title: "Dashboard", url: "/dashboard/parent",          icon: <LayoutDashboardIcon /> },
      { title: "Children",  url: "/dashboard/parent/children", icon: <UsersIcon /> },
    ];
  } else {
    // Fallback for unknown roles
    navMainItems = [
      { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
    ];
  }

  // Secondary navigation – same for all roles
  const navSecondaryItems = [
    { title: "Settings", url: "/dashboard/settings", icon: <Settings2Icon /> },
    { title: "Get Help", url: "/dashboard/help", icon: <CircleHelpIcon /> },
    { title: "Search", url: "/dashboard/search", icon: <SearchIcon /> },
  ];

  // User info
  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@school.com",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href={role === "TEACHER" ? "/dashboard/teacher" : role === "PARENT" ? "/dashboard/parent" : "/dashboard"} />}
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