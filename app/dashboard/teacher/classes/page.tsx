// app/dashboard/teacher/classes/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarCheck, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function TeacherClassesPage() {
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

  if (!teacherProfile) redirect("/dashboard/teacher");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground">
          All classes and subjects you are assigned to teach.
        </p>
      </div>

      {teacherProfile.classSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-lg border border-dashed">
          <BookOpen className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No classes assigned yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teacherProfile.classSubjects.map((cs) => (
            <Card key={cs.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {cs.class.name} - {cs.class.section}
                    </CardTitle>
                    <CardDescription>{cs.subject.name}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {cs.class.academicYear?.name || "N/A"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{cs.class._count.students} students</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/teacher/attendance?classId=${cs.classId}`}>
                      <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
                      Attendance
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href="/dashboard/teacher/grades">
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                      Grades
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
