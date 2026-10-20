// app/dashboard/exams/[id]/results/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Users, CheckCircle2, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function scoreColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 90) return "text-green-600 dark:text-green-400";
  if (pct >= 75) return "text-blue-600 dark:text-blue-400";
  if (pct >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      class: true,
      academicYear: true,
      submissions: {
        include: {
          student: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
        orderBy: { totalScore: "desc" },
      },
      _count: { select: { questions: true } },
    },
  });

  if (!exam) redirect("/dashboard/exams");

  const submitted = exam.submissions.filter((s) => s.status === "SUBMITTED" || s.status === "GRADED");
  const scores = submitted.map((s) => s.totalScore || 0);
  const avg = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
  const highest = scores.length > 0 ? Math.max(...scores) : 0;
  const passing = submitted.filter((s) => ((s.totalScore || 0) / exam.maxScore) * 100 >= 50).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/exams"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{exam.title} — Results</h1>
          <p className="text-sm text-muted-foreground">
            {exam.class ? `${exam.class.name} - ${exam.class.section}` : "School-wide"} • Max Score: {exam.maxScore}
          </p>
        </div>
        <Badge>{exam.status}</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Submissions", value: submitted.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Average Score", value: `${avg}`, icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Highest Score", value: `${highest}`, icon: Trophy, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Passing (≥50%)", value: passing, icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
              <div className={cn("rounded-full p-2", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Student Results</CardTitle>
          <CardDescription>Ranked by score (highest first)</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No submissions yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-12 text-xs font-semibold uppercase text-center">#</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Student</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Score</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Percentage</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submitted.map((sub, idx) => {
                  const score = sub.totalScore || 0;
                  const pct = Math.round((score / exam.maxScore) * 100);
                  const pass = pct >= 50;
                  return (
                    <TableRow key={sub.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-center font-medium text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {sub.student.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{sub.student.user.name}</div>
                            <div className="text-xs text-muted-foreground">{sub.student.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("text-lg font-bold", scoreColor(score, exam.maxScore))}>
                          {score} / {exam.maxScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", pass ? "bg-green-500" : "bg-red-500")} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-medium">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={pass ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}>
                          {pass ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.submittedAt ? format(new Date(sub.submittedAt), "MMM d, h:mm a") : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
