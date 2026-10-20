// app/dashboard/teacher/exams/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PlusIcon, PencilIcon, ListIcon } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300",
  PUBLISHED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  ACTIVE:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CLOSED:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default async function TeacherExamsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { classSubjects: { select: { classId: true } } },
  });

  if (!teacherProfile) redirect("/dashboard/teacher");

  const classIds = [...new Set(teacherProfile.classSubjects.map((cs) => cs.classId).filter(Boolean))];

  // Exams for teacher's classes
  const exams = await prisma.exam.findMany({
    where: classIds.length > 0 ? { classId: { in: classIds } } : { classId: null },
    include: {
      academicYear: { select: { name: true } },
      class: { select: { name: true, section: true } },
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Exams</h1>
          <p className="text-muted-foreground">Create and manage exams for your classes.</p>
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
          <CardDescription>{exams.length} exam{exams.length !== 1 ? "s" : ""} found</CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No exams yet. Create your first exam.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold uppercase">Title</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Class</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Dates</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Questions</TableHead>
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
                      {format(new Date(exam.startDate), "MMM d")} – {format(new Date(exam.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{exam._count.questions} Q</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[exam.status] || ""}>{exam.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
