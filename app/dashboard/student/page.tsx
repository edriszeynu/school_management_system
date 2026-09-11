// @ts-nocheck
// app/dashboard/student/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, getDay } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
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
import {
  BookOpen,
  TrendingUp,
  TrendingUpIcon,
  CalendarCheck,
  DollarSign,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/count-up";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true, class: { include: { academicYear: true } } },
  });

  if (!studentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Student profile not found</h2>
        <p className="text-muted-foreground">Please contact the administrator.</p>
      </div>
    );
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [grades, attendance, invoices, timetableEntries] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId: studentProfile.id },
      include: { exam: true, classSubject: { include: { subject: true, class: true } } },
      orderBy: { exam: { startDate: "desc" } },
    }),
    prisma.attendance.findMany({
      where: { studentId: studentProfile.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.invoice.findMany({
      where: { studentId: studentProfile.id },
      include: { feeStructure: true, payments: true },
      orderBy: { dueDate: "desc" },
    }),
    prisma.timetable.findMany({
      where: { classSubject: { classId: studentProfile.classId } },
      include: {
        classSubject: {
          include: {
            class: true, subject: true,
            teacherProfile: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    }),
  ]);

  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "PRESENT").length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  const unpaidInvoices = invoices.filter((inv) => inv.status === "UNPAID" || inv.status === "OVERDUE");
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const periods = Array.from(new Set(timetableEntries.map((t) => t.period))).sort((a, b) => a - b);
  const timetableMap: Record<string, Record<number, typeof timetableEntries[0] | null>> = {};
  days.forEach((day) => {
    timetableMap[day] = {};
    periods.forEach((p) => { timetableMap[day][p] = null; });
  });
  timetableEntries.forEach((entry) => {
    if (timetableMap[entry.dayOfWeek]?.[entry.period] !== undefined) {
      timetableMap[entry.dayOfWeek][entry.period] = entry;
    }
  });

  const today = new Date();
  const todayDayName = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][getDay(today)];

  const stats = [
    {
      title: "Total Subjects",
      value: new Set(grades.map((g) => g.classSubject.subjectId)).size || 0,
      icon: <BookOpen className="size-4" />,
      trend: "This semester",
      trendUp: true,
      description: "Subjects enrolled",
    },
    {
      title: "Average Grade",
      value: grades.length > 0 ? `${Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)}%` : "N/A",
      icon: <TrendingUp className="size-4" />,
      trend: `${grades.length} exams taken`,
      trendUp: true,
      description: "Across all subjects",
    },
    {
      title: "Attendance",
      value: `${attendancePercentage}%`,
      icon: <CalendarCheck className="size-4" />,
      trend: `${presentDays}/${totalDays} days`,
      trendUp: attendancePercentage >= 75,
      description: "Last 30 days",
    },
    {
      title: "Pending Fees",
      value: totalUnpaid > 0 ? `$${totalUnpaid.toFixed(2)}` : "All Paid 🎉",
      icon: <DollarSign className="size-4" />,
      trend: `${unpaidInvoices.length} invoice${unpaidInvoices.length !== 1 ? "s" : ""}`,
      trendUp: totalUnpaid === 0,
      description: "Unpaid fees",
    },
  ];

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

        {/* Header */}
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {studentProfile.user.name}</h1>
          <p className="text-muted-foreground">Here's your academic overview.</p>
          <p className="text-sm mt-1 text-muted-foreground">
            Class: {studentProfile.class?.name} - {studentProfile.class?.section} • Roll No: {studentProfile.rollNumber || "N/A"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
          {stats.map((stat) => (
            <Card key={stat.title} className="@container/card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stat.value}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon className={`size-3 ${!stat.trendUp ? "rotate-180" : ""}`} />
                    {stat.trend}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {stat.icon}
                  {stat.description}
                </div>
                <div className="text-muted-foreground">Updated in real-time</div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Two-column: Grades + Timetable */}
        <div className="px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Grades</CardTitle>
                <CardDescription>Your latest exam results</CardDescription>
              </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">No grades available yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.slice(0, 5).map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell>{grade.classSubject.subject.name}</TableCell>
                          <TableCell>{grade.exam.title}</TableCell>
                          <TableCell className="text-right font-medium">{grade.score}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Today's Timetable</CardTitle>
                <CardDescription>
                  {todayDayName !== "SATURDAY" && todayDayName !== "SUNDAY"
                    ? format(today, "EEEE, MMMM d, yyyy")
                    : "No classes on weekends"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayDayName === "SATURDAY" || todayDayName === "SUNDAY" ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>Enjoy your weekend!</p>
                  </div>
                ) : timetableMap[todayDayName] && Object.values(timetableMap[todayDayName]).some(e => e !== null) ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Room</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periods.map((period) => {
                        const entry = timetableMap[todayDayName]?.[period];
                        if (!entry) return null;
                        return (
                          <TableRow key={period}>
                            <TableCell className="font-medium">{period}</TableCell>
                            <TableCell>{entry.classSubject.subject.name}</TableCell>
                            <TableCell>{entry.classSubject.teacherProfile?.user?.name || "N/A"}</TableCell>
                            <TableCell>{entry.room || "N/A"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No classes scheduled for today.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Attendance History */}
        <div className="px-4 lg:px-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Attendance</CardTitle>
              <CardDescription>Your attendance for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No attendance records found.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {attendance.slice(0, 30).map((record) => {
                    const statusColors: Record<string, string> = {
                      PRESENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                      ABSENT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                      LATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                      EXCUSED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                      HOLIDAY: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
                    };
                    return (
                      <Badge key={record.id} className={cn("px-3 py-1 text-xs font-medium", statusColors[record.status] || "bg-gray-100")}>
                        {format(new Date(record.date), "MMM d")} • {record.status}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fee Status */}
        <div className="px-4 lg:px-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Fee Status</CardTitle>
              <CardDescription>Your latest invoices and payment status</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No invoices found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.slice(0, 5).map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.feeStructure?.name || "N/A"}</TableCell>
                        <TableCell>${inv.amount.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(inv.dueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={
                            inv.status === "PAID" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : inv.status === "OVERDUE" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }>
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
