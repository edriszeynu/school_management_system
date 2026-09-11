// app/(dashboard)/reports/page.tsx
import { prisma } from "@/lib/prisma";
import { DashboardBackButton } from "@/components/dashboard-back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  BookOpen,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import ReportsCharts from "./ReportsCharts";

export default async function ReportsPage() {
  // ---- Fetch data in parallel ----
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    overdueInvoices,
    totalPayments,
    attendanceLast7Days,
    classEnrollment,
    recentPayments,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.class.count(),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "UNPAID" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: subDays(new Date(), 7),
        },
      },
      select: {
        status: true,
        date: true,
      },
    }),
    prisma.class.findMany({
      select: {
        name: true,
        _count: { select: { students: true } },
      },
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { paymentDate: "desc" },
      include: {
        invoice: {
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  // ---- Prepare chart data ----
  // 1. Fee collection trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), i);
    return format(d, "yyyy-MM-dd");
  }).reverse();

  const paymentData = last7Days.map((date) => {
    const dayPayments = attendanceLast7Days.filter(
      (p) => format(p.date, "yyyy-MM-dd") === date
    );
    return {
      date: format(new Date(date), "MMM dd"),
      amount: dayPayments.length,
    };
  });

  // 2. Attendance status distribution (last 7 days)
  const statusCounts = attendanceLast7Days.reduce(
    (acc, cur) => {
      acc[cur.status] = (acc[cur.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const attendanceData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const ATTENDANCE_COLORS = {
    PRESENT: "#10b981",
    ABSENT: "#ef4444",
    LATE: "#f59e0b",
    EXCUSED: "#8b5cf6",
    HOLIDAY: "#6b7280",
  };

  const attendanceChartData = attendanceData.map((item) => ({
    ...item,
    color: ATTENDANCE_COLORS[item.name as keyof typeof ATTENDANCE_COLORS] || "#6b7280",
  }));

  // 3. Class enrollment
  const enrollmentData = classEnrollment
    .map((cls) => ({
      name: cls.name,
      students: cls._count.students,
    }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 10);

  // ---- Stats cards ----
  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Total Teachers",
      value: totalTeachers,
      icon: UserCheck,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Total Classes",
      value: totalClasses,
      icon: BookOpen,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Revenue (Total Paid)",
      value: `$${totalPayments._sum.amount?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ];

  // ---- Invoice summary ----
  const invoiceSummary = [
    { label: "Total Invoices", value: totalInvoices },
    { label: "Paid", value: paidInvoices, color: "text-green-600" },
    { label: "Unpaid", value: unpaidInvoices, color: "text-yellow-600" },
    { label: "Overdue", value: overdueInvoices, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <DashboardBackButton />
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Overview of school performance metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportsCharts
        paymentData={paymentData}
        attendanceChartData={attendanceChartData}
        enrollmentData={enrollmentData}
      />

      {/* Invoice Summary & Recent Payments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Summary Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {invoiceSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border p-3 flex flex-col items-center"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-xl font-bold ${item.color || ""}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No recent payments
                    </TableCell>
                  </TableRow>
                ) : (
                  recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.invoice?.student?.user?.name || "N/A"}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(payment.paymentDate, "MMM dd, yyyy")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}