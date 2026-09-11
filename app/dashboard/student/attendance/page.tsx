// app/dashboard/student/attendance/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ArrowLeft, CalendarCheck, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Status config
const statusConfig: Record<
  string,
  { label: string; icon: any; color: string; badge: string }
> = {
  PRESENT: {
    label: "Present",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    badge:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  ABSENT: {
    label: "Absent",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  LATE: {
    label: "Late",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  EXCUSED: {
    label: "Excused",
    icon: AlertCircle,
    color: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  HOLIDAY: {
    label: "Holiday",
    icon: CalendarCheck,
    color: "text-gray-600 dark:text-gray-400",
    badge:
      "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
  },
};

export default async function StudentAttendancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get student profile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true } },
      class: { select: { name: true, section: true } },
    },
  });

  if (!studentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Student profile not found.</p>
      </div>
    );
  }

  // Fetch all attendance records
  const attendance = await prisma.attendance.findMany({
    where: { studentId: studentProfile.id },
    orderBy: { date: "desc" },
  });

  // Compute stats
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "PRESENT").length;
  const absentDays = attendance.filter((a) => a.status === "ABSENT").length;
  const lateDays = attendance.filter((a) => a.status === "LATE").length;
  const excusedDays = attendance.filter((a) => a.status === "EXCUSED").length;
  const attendancePercentage =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Group attendance by month (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return {
      label: format(d, "MMMM yyyy"),
      start: startOfMonth(d),
      end: endOfMonth(d),
    };
  }).reverse();

  const monthlyStats = months.map((month) => {
    const monthRecords = attendance.filter(
      (a) => a.date >= month.start && a.date <= month.end
    );
    const present = monthRecords.filter((a) => a.status === "PRESENT").length;
    const total = monthRecords.length;
    return {
      label: month.label,
      present,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });

  // Stats cards
  const stats = [
    {
      title: "Attendance Rate",
      value: `${attendancePercentage}%`,
      icon: CalendarCheck,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      sub: `${presentDays}/${totalDays} days present`,
    },
    {
      title: "Present",
      value: presentDays,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Absent",
      value: absentDays,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Late",
      value: lateDays,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      title: "Excused",
      value: excusedDays,
      icon: AlertCircle,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/student">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground">
            {studentProfile.class?.name} - {studentProfile.class?.section} • Roll No:{" "}
            {studentProfile.rollNumber || "N/A"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.sub && (
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Overview</CardTitle>
          <CardDescription>
            Attendance percentage for the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyStats.map((month) => (
              <div key={month.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{month.label}</span>
                  <span className="text-muted-foreground">
                    {month.present}/{month.total} days ({month.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      month.percentage >= 90
                        ? "bg-green-500"
                        : month.percentage >= 75
                          ? "bg-blue-500"
                          : month.percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    )}
                    style={{ width: `${month.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Attendance Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Attendance Records</CardTitle>
          <CardDescription>
            {totalDays} record{totalDays > 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => {
                    const config =
                      statusConfig[record.status] || statusConfig.PRESENT;
                    const Icon = config.icon;
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(record.date), "EEEE")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium flex items-center gap-1 w-fit",
                              config.badge
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.remarks || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Dashboard */}
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/student">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}