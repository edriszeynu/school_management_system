// app/dashboard/student/grades/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, BookOpen } from "lucide-react";

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

// Helper to get grade color
function getGradeColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 75) return "text-blue-600 dark:text-blue-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

// Helper to get grade letter
function getGradeLetter(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get student profile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, userId: true, classId: true },
  });

  if (!studentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Student profile not found.</p>
      </div>
    );
  }

  // Fetch all grades with relations
  const grades = await prisma.grade.findMany({
    where: { studentId: studentProfile.id },
    include: {
      exam: true,
      classSubject: {
        include: {
          subject: true,
          class: true,
        },
      },
    },
    orderBy: [{ classSubject: { subject: { name: "asc" } } }, { exam: { startDate: "desc" } }],
  });

  // Group by subject for summary
  const subjectMap = new Map<string, { subjectName: string; scores: number[]; examCount: number }>();
  grades.forEach((g) => {
    const subjectId = g.classSubject.subjectId;
    const subjectName = g.classSubject.subject.name;
    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, { subjectName, scores: [], examCount: 0 });
    }
    const entry = subjectMap.get(subjectId)!;
    entry.scores.push(g.score);
    entry.examCount += 1;
  });

  const subjectSummaries = Array.from(subjectMap.entries()).map(([subjectId, data]) => {
    const avg = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length;
    return {
      subjectId,
      subjectName: data.subjectName,
      avgScore: Math.round(avg * 10) / 10,
      examCount: data.examCount,
      highest: Math.max(...data.scores),
      lowest: Math.min(...data.scores),
    };
  });

  const overallAverage = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length * 10) / 10
    : null;

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
          <h1 className="text-2xl font-bold tracking-tight">My Grades</h1>
          <p className="text-muted-foreground">
            View all your exam results and subject performance
          </p>
        </div>
      </div>

      {/* Overall Average Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Overall Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold">
              {overallAverage !== null ? `${overallAverage}%` : "N/A"}
            </span>
            {overallAverage !== null && (
              <Badge
                className={cn(
                  "text-sm font-semibold px-3 py-1",
                  overallAverage >= 75
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : overallAverage >= 50
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                )}
              >
                {overallAverage >= 75 ? "Good" : overallAverage >= 50 ? "Average" : "Needs Improvement"}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-auto">
              {grades.length} exam{grades.length > 1 ? "s" : ""} total
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Subject Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjectSummaries.map((subject) => (
          <Card key={subject.subjectId} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                {subject.subjectName}
              </CardTitle>
              <CardDescription>
                {subject.examCount} exam{subject.examCount > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{subject.avgScore}%</span>
                <span className={cn("text-sm font-medium", getGradeColor(subject.avgScore))}>
                  {getGradeLetter(subject.avgScore)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <span>Highest: {subject.highest}%</span>
                <span>Lowest: {subject.lowest}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {subjectSummaries.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p>No grades available yet.</p>
          </div>
        )}
      </div>

      {/* Detailed Grades Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Grades</CardTitle>
          <CardDescription>Detailed list of all your exam scores</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No grades available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">
                        {grade.classSubject.subject.name}
                      </TableCell>
                      <TableCell>{grade.exam.title}</TableCell>
                      <TableCell>{format(new Date(grade.exam.startDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right font-medium">
                        {grade.score}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={cn("font-semibold", getGradeColor(grade.score))}>
                          {getGradeLetter(grade.score)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {grade.remarks || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
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