// app/dashboard/exams/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import ExamForm from "@/app/dashboard/exams/new/ExamForm";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [exam, academicYears, classes] = await Promise.all([
    prisma.exam.findUnique({ where: { id } }),
    prisma.academicYear.findMany({ orderBy: { name: "desc" } }),
    prisma.class.findMany({
      include: { academicYear: { select: { name: true } } },
      orderBy: { name: "asc" } }),
  ]);

  if (!exam) return <div>Exam not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <ExamForm
        exam={exam}
        academicYears={academicYears}
        classes={classes}
      />
    </div>
  );
}