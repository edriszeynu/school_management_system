// app/dashboard/parent/page.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  User,
} from "lucide-react";
import { cn, getGradeColor, getGradeLetter } from "@/lib/utils";
import { CountUp } from "@/components/motion/count-up";

export default async function ParentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // 1. Get parent's linked students
  const parentRelations = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        include: {
          user: true,
          class: { include: { academicYear: true } },
        },
      },
    },
  });

  if (parentRelations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">No children linked</h2>
        <p className="text-muted-foreground">
          You don't have any students linked to your account yet.
          Please contact the school administrator.
        </p>
      </div>
    );
  }

  const studentsWithRelation = parentRelations.map((rel) => ({
    student: rel.student,
    relation: rel.relation,
  }));

  const studentIds = studentsWithRelation.map((s) => s.student.id);
  const classIds = studentsWithRelation
    .map((s) => s.student.classId)
    .filter(Boolean) as string[];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 2. Batch all queries across all children at once
  const [allGrades, allAttendance, allInvoices, allTimetable] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId: { in: studentIds } },
      include: {
        exam: true,
        classSubject: { include: { subject: true, class: true } },
      },
      orderBy: { exam: { startDate: "desc" } },
    }),
    prisma.attendance.findMany({
      where: { studentId: { in: studentIds }, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.invoice.findMany({
      where: { studentId: { in: studentIds } },
      include: { feeStructure: true },
      orderBy: { dueDate: "desc" },
    }),
    prisma.timetable.findMany({
      where: { classSubject: { classId: { in: classIds } } },
      include: {
        classSubject: {
          include: {
            class: true,
            subject: true,
            teacherProfile: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    }),
  ]);

  // 3. Group batched results per student
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const studentData = studentsWithRelation.map(({ student, relation }) => {
    const grades = allGrades.filter((g) => g.studentId === student.id);
    const attendance = allAttendance.filter((a) => a.studentId === student.id);
    const invoices = allInvoices.filter((i) => i.studentId === student.id);
    const timetableEntries = allTimetable.filter(
      (t) => t.classSubject.classId === student.classId
    );

    const presentDays = attendance.filter((a) => a.status === "PRESENT").length;
    const attendancePercentage =
      attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;

    const unpaidInvoices = invoices.filter(
      (inv) => inv.status === "UNPAID" || inv.status === "OVERDUE"
    );
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const periods = Array.from(new Set(timetableEntries.map((t) => t.period))).sort(
      (a, b) => a - b
    );
    const timetableMap: Record<string, Record<number, typeof timetableEntries[0] | null>> = {};
    days.forEach((day) => {
      timetableMap[day] = {};
      periods.forEach((period) => { timetableMap[day][period] = null; });
    });
    timetableEntries.forEach((entry) => {
      if (timetableMap[entry.dayOfWeek]?.[entry.period] !== undefined) {
        timetableMap[entry.dayOfWeek][entry.period] = entry;
      }
    });

    const subjectMap = new Map<string, { name: string; scores: number[] }>();
    grades.forEach((g) => {
      const sid = g.classSubject.subjectId;
      if (!subjectMap.has(sid)) subjectMap.set(sid, { name: g.classSubject.subject.name, scores: [] });
      subjectMap.get(sid)!.scores.push(g.score);
    });
    const subjectSummaries = Array.from(subjectMap.entries()).map(([id, data]) => ({
      subjectId: id,
      subjectName: data.name,
      avgScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10,
      examCount: data.scores.length,
    }));

    const overallAverage =
      grades.length > 0
        ? Math.round((grades.reduce((sum, g) => sum + g.score, 0) / grades.length) * 10) / 10
        : null;

    return {
      student,
      relation,
      grades,
      attendance,
      attendancePercentage,
      presentDays,
      totalAttendanceDays: attendance.length,
      invoices,
      unpaidInvoices,
      totalUnpaid,
      timetableMap,
      periods,
      days,
      subjectSummaries,
      overallAverage,
      timetableEntries,
    };
  });

  // 4. Compute overall stats
  const totalChildren = studentData.length;
  const totalSubjects = new Set(
    studentData.flatMap((s) => s.subjectSummaries.map((sub) => sub.subjectId))
  ).size;
  const allAverages = studentData
    .map((s) => s.overallAverage)
    .filter((avg) => avg !== null) as number[];
  const overallAvgAll =
    allAverages.length > 0
      ? Math.round((allAverages.reduce((a, b) => a + b, 0) / allAverages.length) * 10) / 10
      : null;
  const totalUnpaidAll = studentData.reduce((sum, s) => sum + s.totalUnpaid, 0);
  const avgAttendanceAll =
    studentData.length > 0
      ? Math.round(studentData.reduce((sum, s) => sum + s.attendancePercentage, 0) / studentData.length)
      : 0;

  const stats = [
    { title: "Children",        value: totalChildren,                                     icon: <Users className="size-4" />,       trend: `${totalChildren} linked`,          description: "Your children"          },
    { title: "Subjects",        value: totalSubjects,                                     icon: <BookOpen className="size-4" />,    trend: "Across all children",             description: "Total subjects"         },
    { title: "Overall Average", value: overallAvgAll !== null ? `${overallAvgAll}%` : "N/A", icon: <TrendingUp className="size-4" />, trend: `${allAverages.length} students`,  description: "Combined average"       },
    { title: "Avg Attendance",  value: `${avgAttendanceAll}%`,                            icon: <CalendarCheck className="size-4" />, trend: "Last 30 days",                  description: "Attendance rate"        },
    { title: "Pending Fees",    value: totalUnpaidAll > 0 ? `$${totalUnpaidAll.toFixed(2)}` : "All Paid 🎉", icon: <DollarSign className="size-4" />, trend: "Unpaid invoices", description: "Outstanding balance" },
  ];

  const today = new Date();
  const todayIndex = getDay(today);
  const todayDayName = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][todayIndex];

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your children's academic progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5 dark:*:data-[slot=card]:bg-card">
        {stats.map((stat) => (
          <Card key={stat.title} className="@container/card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {typeof stat.value === "number"
                  ? <CountUp value={stat.value} />
                  : stat.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">{stat.trend}</Badge>
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

      {/* Children Tabs */}
      <div className="px-4 lg:px-6">
      <Tabs defaultValue={studentData[0]?.student.id} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {studentData.map(({ student, relation }) => (
            <TabsTrigger key={student.id} value={student.id} className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {student.user.name}
              <Badge variant="outline" className="ml-1 text-[10px]">{relation}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {studentData.map((data) => (
          <TabsContent key={data.student.id} value={data.student.id} className="space-y-6">
            {/* Child Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{data.student.user.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Class: {data.student.class?.name} - {data.student.class?.section} • Roll: {data.student.rollNumber || "N/A"} • {data.relation}
                </p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Badge variant="outline">{data.grades.length} grades</Badge>
                <Badge variant="outline">{data.attendance.length} days</Badge>
              </div>
            </div>

            {/* Child Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {data.overallAverage !== null ? `${data.overallAverage}%` : "N/A"}
                  </div>
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{data.attendancePercentage}%</div>
                  <p className="text-xs text-muted-foreground">{data.presentDays}/{data.totalAttendanceDays} present</p>
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Pending Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">
                    {data.totalUnpaid > 0 ? `$${data.totalUnpaid.toFixed(2)}` : "$0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">{data.unpaidInvoices.length} invoices</p>
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{data.subjectSummaries.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {data.subjectSummaries.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground">No grades available.</div>
                  ) : data.subjectSummaries.map((sub) => (
                    <div key={sub.subjectId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{sub.subjectName}</div>
                        <div className="text-xs text-muted-foreground">{sub.examCount} exams</div>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-lg font-bold", getGradeColor(sub.avgScore))}>{sub.avgScore}%</span>
                        <Badge className="ml-1">{getGradeLetter(sub.avgScore)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Grades</CardTitle>
              </CardHeader>
              <CardContent>
                {data.grades.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No grades available yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.grades.slice(0, 5).map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell>{grade.classSubject.subject.name}</TableCell>
                          <TableCell>{grade.exam.title}</TableCell>
                          <TableCell className="text-right font-medium">{grade.score}%</TableCell>
                          <TableCell className="text-muted-foreground">{grade.remarks || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Today's Timetable */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Today's Timetable</CardTitle>
                <CardDescription>
                  {todayDayName !== "SATURDAY" && todayDayName !== "SUNDAY"
                    ? format(today, "EEEE, MMMM d, yyyy")
                    : "Weekend - no classes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayDayName === "SATURDAY" || todayDayName === "SUNDAY" ? (
                  <div className="text-center py-4 text-muted-foreground">Enjoy your weekend!</div>
                ) : data.timetableMap[todayDayName] &&
                  Object.values(data.timetableMap[todayDayName]).some((e) => e !== null) ? (
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
                      {data.periods.map((period) => {
                        const entry = data.timetableMap[todayDayName]?.[period];
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
                  <div className="text-center py-4 text-muted-foreground">No classes scheduled for today.</div>
                )}
              </CardContent>
            </Card>

            {/* Fee Invoices */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Fee Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {data.invoices.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No invoices found.</div>
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
                      {data.invoices.slice(0, 5).map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>{inv.feeStructure?.name || "N/A"}</TableCell>
                          <TableCell>${inv.amount.toFixed(2)}</TableCell>
                          <TableCell>{format(new Date(inv.dueDate), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                inv.status === "PAID"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : inv.status === "OVERDUE"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              }
                            >
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
          </TabsContent>
        ))}
      </Tabs>
      </div>
      </div>
    </div>
  );
}
