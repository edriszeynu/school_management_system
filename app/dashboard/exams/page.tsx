import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon, PencilIcon, ListIcon, Trophy } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";
import { format } from "date-fns";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ExamStatusButton } from "./ExamStatusButton";

export default async function ExamsPage() {
  const exams = await prisma.exam.findMany({
    include: {
      academicYear: { select: { name: true } },
      class: { select: { name: true, section: true } },
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold">Exams</h1>
          <p className="text-muted-foreground">Manage and supervise all exams</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/exams/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Exams</CardTitle>
          <CardDescription>{exams.length} exam{exams.length !== 1 ? "s" : ""} total</CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No exams yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold uppercase">Title</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Class</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Academic Year</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Dates</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Q / Submissions</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {exam.class ? `${exam.class.name} - ${exam.class.section}` : "School-wide"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {exam.academicYear.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(exam.startDate), "MMM d")} – {format(new Date(exam.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {exam._count.questions} Q / {exam._count.submissions} sub
                    </TableCell>
                    <TableCell>
                      <ExamStatusButton examId={exam.id} currentStatus={exam.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/exams/${exam.id}/results`}>
                            <Trophy className="h-3.5 w-3.5 mr-1" />
                            Results
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/exams/${exam.id}/questions`}>
                            <ListIcon className="h-3.5 w-3.5 mr-1" />
                            Questions
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/exams/${exam.id}/edit`}>
                            <PencilIcon className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
