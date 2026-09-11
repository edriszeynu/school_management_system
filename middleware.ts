import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getDashboardPath } from "@/lib/roles";

// Define which roles are allowed for each route prefix
const rolePermissions: Record<string, string[]> = {
  // Dashboard overview is for school administrators.
  "/dashboard": ["SUPER_ADMIN", "SCHOOL_ADMIN"],

  // Admin & Super Admin only (high‑sensitivity)
  "/dashboard/admin": ["SUPER_ADMIN", "SCHOOL_ADMIN"],

  // Core management – Admins only
  "/dashboard/students": ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  "/dashboard/teachers": ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  "/dashboard/classes": ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  "/dashboard/fees": ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"],
  "/dashboard/reports": ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"],

  // Administration and academic management
  "/dashboard/users": ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  "/dashboard/announcements": ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  "/dashboard/exams": ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  "/dashboard/fee-structures": ["SUPER_ADMIN", "SCHOOL_ADMIN"],

  // Attendance – Admins + Teachers
  "/dashboard/attendance": ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"],

  // Settings, Help, Search – all authenticated users
  "/dashboard/settings": ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/help": ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/search": ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "TEACHER", "STUDENT", "PARENT"],

  // Role‑specific dashboards (to be built)
  "/dashboard/teacher": ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"],
  "/dashboard/student": ["SUPER_ADMIN", "SCHOOL_ADMIN", "STUDENT", "PARENT"],
  "/dashboard/parent": ["SUPER_ADMIN", "SCHOOL_ADMIN", "PARENT"],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is not logged in, the `authorized` callback will redirect to login.
    // But we also check here for extra safety.
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = token.role as string;

    // Find the matching permission rule (longest prefix match)
    const matchingPrefix = Object.keys(rolePermissions)
      .filter((prefix) => path.startsWith(prefix))
      .sort((a, b) => b.length - a.length)[0];

    if (matchingPrefix) {
      const allowedRoles = rolePermissions[matchingPrefix];
      if (!allowedRoles.includes(userRole)) {
        // User's role is not allowed – redirect to their own dashboard or /dashboard
        // Optionally, redirect to a "403 Forbidden" page (you can create one)
        return NextResponse.redirect(new URL(getDashboardPath(userRole), req.url));
      }
    }

    // Allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Must be logged in
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all routes under /dashboard (including sub‑routes)
export const config = {
  matcher: ["/dashboard/:path*"],
};