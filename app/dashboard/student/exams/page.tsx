// app/dashboard/student/exams/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StudentExamsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, classId: true },
  });
  if (!student) return <p>Profile not found</p>;

  const exams = await prisma.exam.findMany({
    where: {
      OR: [{ classId: student.classId }, { classId: null }],
      status: { in: ["PUBLISHED", "ACTIVE"] },
    },
    include: {
      class: true,
      _count: { select: { questions: true } },
      submissions: { where: { studentId: student.id } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Exams</h1>
        <p className="text-muted-foreground">Available and upcoming exams</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8 text-muted-foreground">
              No exams available at the moment.
            </CardContent>
          </Card>
        )}
        {exams.map((exam) => {
          const submission = exam.submissions[0];
          const isSubmitted = submission?.status === "SUBMITTED" || submission?.status === "GRADED";
          const canTake = exam.status === "ACTIVE" && !isSubmitted;

          return (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{exam.title}</CardTitle>
                  <Badge variant={exam.status === "ACTIVE" ? "default" : "secondary"}>
                    {exam.status}
                  </Badge>
                </div>
                <CardDescription>
                  {exam.class ? `${exam.class.name} - ${exam.class.section}` : "School-wide"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(exam.startDate), "MMM d")} – {format(new Date(exam.endDate), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  {exam._count.questions} questions • {exam.maxScore} points
                </div>
                {isSubmitted ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Submitted (Score: {submission.totalScore ?? "Pending"})
                  </div>
                ) : (
                  <Button asChild disabled={!canTake} className="w-full">
                    <Link href={`/dashboard/student/exams/${exam.id}`}>
                      {exam.status === "ACTIVE" ? "Start Exam" : "Not Yet Open"}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}