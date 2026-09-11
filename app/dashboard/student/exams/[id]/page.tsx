// app/dashboard/student/exams/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { startExam } from "@/app/actions/exam-submission";
import TakeExamForm from "./TakeExamForm";

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return <p>Profile not found</p>;

  // Check if already submitted
  const existing = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId: id, studentId: student.id } },
  });
  if (existing?.status === "SUBMITTED" || existing?.status === "GRADED") {
    redirect("/dashboard/student/exams");
  }

  const exam = await prisma.exam.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!exam) redirect("/dashboard/student/exams");

  // Start or resume submission
  const submission = await startExam(id, student.id);

  return (
    <TakeExamForm
      exam={{
        id: exam.id,
        title: exam.title,
        instructions: exam.instructions,
        questions: exam.questions.map((q) => ({
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          points: q.points,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
        })),
      }}
      submissionId={submission.id}
    />
  );
}