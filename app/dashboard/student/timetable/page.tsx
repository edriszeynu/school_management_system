// app/dashboard/student/timetable/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, startOfWeek, addDays, isToday, getDay } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

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

export default async function StudentTimetablePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get student profile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { classId: true },
  });

  if (!studentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Student profile not found.</p>
      </div>
    );
  }

  // Fetch timetable for the student's class
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const timetableEntries = await prisma.timetable.findMany({
    where: {
      classSubject: {
        classId: studentProfile.classId,
      },
    },
    include: {
      classSubject: {
        include: {
          class: true,
          subject: true,
          teacherProfile: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
  });

  // Get periods
  const periods = Array.from(
    new Set(timetableEntries.map((t) => t.period))
  ).sort((a, b) => a - b);

  // Build timetable map
  const timetableMap: Record<string, Record<number, typeof timetableEntries[0] | null>> = {};
  days.forEach((day) => {
    timetableMap[day] = {};
    periods.forEach((period) => {
      timetableMap[day][period] = null;
    });
  });

  timetableEntries.forEach((entry) => {
    const day = entry.dayOfWeek;
    const period = entry.period;
    if (timetableMap[day] && timetableMap[day][period] !== undefined) {
      timetableMap[day][period] = entry;
    }
  });

  // Today's day
  const today = new Date();
  const todayIndex = getDay(today);
  const todayDayName = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][todayIndex];

  // Get the class name for display
  const classInfo = await prisma.class.findUnique({
    where: { id: studentProfile.classId },
    select: { name: true, section: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/student">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Timetable</h1>
          <p className="text-muted-foreground">
            {classInfo?.name} - {classInfo?.section} • Weekly class schedule
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            {timetableEntries.length === 0
              ? "No classes scheduled for this week."
              : `${timetableEntries.length} class period${timetableEntries.length > 1 ? "s" : ""} scheduled.`}
            {todayDayName !== "SATURDAY" && todayDayName !== "SUNDAY" && (
              <span className="block sm:inline sm:ml-2 text-primary">
                Today: {format(today, "EEEE, MMMM d, yyyy")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timetableEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No classes scheduled for this week.</p>
              <p className="text-sm mt-1">Contact your teacher if this seems incorrect.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Period</TableHead>
                    {days.map((day) => {
                      const dayDate = addDays(startOfWeek(today, { weekStartsOn: 1 }), days.indexOf(day));
                      const isToday = format(dayDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                      return (
                        <TableHead
                          key={day}
                          className={cn(
                            "text-center min-w-[120px]",
                            isToday && "bg-primary/5"
                          )}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                            <span className={cn(
                              "text-xs text-muted-foreground",
                              isToday && "text-primary font-semibold"
                            )}>
                              {format(dayDate, "MMM d")}
                            </span>
                            {isToday && (
                              <Badge variant="default" className="mt-1 text-[10px] h-4">
                                Today
                              </Badge>
                            )}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => (
                    <TableRow key={period}>
                      <TableCell className="text-center font-medium text-muted-foreground text-sm">
                        P{period}
                      </TableCell>
                      {days.map((day) => {
                        const entry = timetableMap[day]?.[period] || null;
                        const isToday = day === todayDayName;
                        return (
                          <TableCell
                            key={`${day}-${period}`}
                            className={cn(
                              "text-center p-2",
                              isToday && "bg-primary/5"
                            )}
                          >
                            {entry ? (
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-sm">
                                  {entry.classSubject.subject.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {entry.classSubject.teacherProfile?.user?.name || "N/A"}
                                </span>
                                {entry.room && (
                                  <span className="text-xs text-muted-foreground">
                                    Room {entry.room}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/30">—</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Summary */}
      {timetableEntries.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Subjects</CardTitle>
            <CardDescription>Subjects taught in your class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(timetableEntries.map((e) => e.classSubject.subject.name))
              ).map((subject) => (
                <Badge key={subject} variant="outline" className="px-3 py-1">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back to Dashboard */}
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/student">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}