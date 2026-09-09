import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Optional: add role-based checks here
    // For example, you could restrict /dashboard/admin to only SUPER_ADMIN
    // const token = req.nextauth.token;
    // const path = req.nextUrl.pathname;
    // if (path.startsWith("/dashboard/admin") && token?.role !== "SUPER_ADMIN") {
    //   return NextResponse.redirect(new URL("/dashboard", req.url));
    // }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow if logged in
    },
    pages: {
      signIn: "/login", // redirect to this page if not authorized
    },
  }
);

// Protect all routes under /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};