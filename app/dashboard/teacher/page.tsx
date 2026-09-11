// app/dashboard/teacher/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  CalendarCheck,
  Clock,
  TrendingUp,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";
import { CountUp } from "@/components/motion/count-up";

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      classSubjects: {
        include: {
          class: {
            include: {
              academicYear: true,
              _count: { select: { students: true } },
            },
          },
          subject: true,
        },
      },
    },
  });

  if (!teacherProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Teacher profile not found</h2>
        <p className="text-muted-foreground">Please contact the administrator.</p>
      </div>
    );
  }

  const today = new Date();
  const dayOfWeek = format(today, "EEEE").toUpperCase();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const classIds = teacherProfile.classSubjects.map((cs) => cs.classId);

  const [timetable, totalStudents, attendanceRecords, totalExams] = await Promise.all([
    prisma.timetable.findMany({
      where: { dayOfWeek, classSubject: { teacherProfileId: teacherProfile.id } },
      include: { classSubject: { include: { class: true, subject: true } } },
      orderBy: { period: "asc" },
    }),
    prisma.studentProfile.count({ where: { classId: { in: classIds } } }),
    prisma.attendance.findMany({
      where: { classId: { in: classIds }, date: { gte: todayStart, lte: todayEnd } },
      select: { status: true },
    }),
    prisma.exam.count({ where: { classId: { in: classIds } } }),
  ]);

  const presentCount = attendanceRecords.filter((a) => a.status === "PRESENT").length;
  const totalAttendance = attendanceRecords.length;
  const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  const stats = [
    {
      title: "My Classes",
      value: teacherProfile.classSubjects.length,
      icon: <BookOpen className="size-4" />,
      trend: "Assigned subjects",
      trendUp: true,
      description: "Active classes",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: <Users className="size-4" />,
      trend: "Across all classes",
      trendUp: true,
      description: "Students enrolled",
    },
    {
      title: "Today's Attendance",
      value: `${attendancePercentage}%`,
      icon: <CalendarCheck className="size-4" />,
      trend: `${presentCount}/${totalAttendance} present`,
      trendUp: attendancePercentage >= 75,
      description: "Marked today",
    },
    {
      title: "Total Exams",
      value: totalExams,
      icon: <TrendingUp className="size-4" />,
      trend: "This academic year",
      trendUp: true,
      description: "Exams scheduled",
    },
  ];

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

        {/* Header */}
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {session.user.name}</h1>
          <p className="text-muted-foreground">Here's your teaching overview for today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
          {stats.map((stat) => (
            <Card key={stat.title} className="@container/card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  <CountUp value={typeof stat.value === "number" ? stat.value : 0} suffix={typeof stat.value === "string" && stat.value.endsWith("%") ? "%" : ""} />
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

        {/* Quick Actions */}
        <div className="px-4 lg:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Mark Attendance</CardTitle>
                <CardDescription>Record attendance for your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/teacher/attendance">Go to Attendance</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Enter Grades</CardTitle>
                <CardDescription>Update student grades for exams</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/dashboard/teacher/grades">Enter Grades</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">My Students</CardTitle>
                <CardDescription>View all students in your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/teacher/students">View Students</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="px-4 lg:px-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
              <CardDescription>{format(today, "EEEE, MMMM d, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              {timetable.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No classes scheduled for today.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetable.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.period}</TableCell>
                        <TableCell>{entry.classSubject.class.name} - {entry.classSubject.class.section}</TableCell>
                        <TableCell>{entry.classSubject.subject.name}</TableCell>
                        <TableCell>{entry.room || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/teacher/attendance?classId=${entry.classSubject.classId}`}>
                              Mark
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Your Classes */}
        <div className="px-4 lg:px-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Your Classes</CardTitle>
              <CardDescription>Overview of each class you teach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teacherProfile.classSubjects.map((cs) => (
                  <Card key={cs.id} className="border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">{cs.class.name} - {cs.class.section}</CardTitle>
                      <CardDescription>{cs.subject.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{cs.class._count.students} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        <span>{cs.class.academicYear?.name || "N/A"}</span>
                      </div>
                      <Button variant="link" className="px-0 h-auto mt-2" asChild>
                        <Link href={`/dashboard/teacher/attendance?classId=${cs.classId}`}>
                          Mark Attendance →
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
