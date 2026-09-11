// app/dashboard/teacher/timetable/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, startOfWeek, addDays, isToday, getDay } from "date-fns";
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
import { getTeacherTimetable } from "@/app/actions/timetable";
import { cn } from "@/lib/utils";

export default async function TeacherTimetablePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get teacher profile
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!teacherProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Teacher profile not found.</p>
      </div>
    );
  }

  // Fetch timetable data
  const { days, periods, timetableMap, entries } = await getTeacherTimetable(
    teacherProfile.id
  );

  // Get today's day name
  const today = new Date();
  const todayIndex = getDay(today); // 0 = Sunday, 1 = Monday...
  const todayDayName = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][todayIndex];

  // Check if today is a weekday
  const isWeekday = todayDayName !== "SATURDAY" && todayDayName !== "SUNDAY";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Timetable</h1>
        <p className="text-muted-foreground">
          Your weekly teaching schedule.
          {isWeekday && (
            <span className="block sm:inline sm:ml-2 text-primary">
              Today is {format(today, "EEEE, MMMM d, yyyy")}
            </span>
          )}
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            {entries.length === 0
              ? "No classes scheduled for this week."
              : `${entries.length} class period${entries.length > 1 ? "s" : ""} scheduled.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You have no classes scheduled for this week.</p>
              <p className="text-sm mt-1">Contact your administrator if this seems incorrect.</p>
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
                                  {entry.classSubject.class.name} - {entry.classSubject.class.section}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {entry.classSubject.subject.name}
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

      {/* Legend / Summary */}
      {entries.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Class Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {Array.from(
                new Map(
                  entries.map((entry) => [
                    entry.classSubject.class.id,
                    {
                      class: `${entry.classSubject.class.name} - ${entry.classSubject.class.section}`,
                      subjects: new Set<string>(),
                    },
                  ])
                )
              ).map(([classId, data]) => {
                // Collect subjects for this class
                entries
                  .filter((e) => e.classSubject.class.id === classId)
                  .forEach((e) => {
                    data.subjects.add(e.classSubject.subject.name);
                  });
                return (
                  <div
                    key={classId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{data.class}</span>
                      <div className="text-xs text-muted-foreground">
                        {Array.from(data.subjects).join(", ")}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {entries.filter((e) => e.classSubject.class.id === classId).length} periods
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}