// app/actions/exam-submission.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Start or resume a submission
export async function startExam(examId: string, studentId: string) {
  const existing = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId } },
  });

  if (existing) return existing;

  return await prisma.examSubmission.create({
    data: { examId, studentId, status: "IN_PROGRESS" },
  });
}

// Submit answers
const answerSchema = z.object({
  submissionId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerText: z.string().nullable(),
      selectedOptionId: z.string().nullable(),
    })
  ),
});

export async function submitExam(data: z.infer<typeof answerSchema>) {
  const validated = answerSchema.parse(data);

  // Fetch all questions to auto-grade
  const questionIds = validated.answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { options: true },
  });

  let totalScore = 0;

  // Save each answer and calculate score for auto-gradable questions
  await prisma.$transaction(
    validated.answers.map((ans) => {
      const question = questions.find((q) => q.id === ans.questionId);
      if (!question) return Promise.resolve();

      let isCorrect: boolean | null = null;
      let pointsEarned: number | null = null;

      // Auto-grade MCQ, True/False, Short Answer
      if (question.type === "MULTIPLE_CHOICE") {
        const selected = question.options.find((o) => o.id === ans.selectedOptionId);
        isCorrect = selected?.isCorrect || false;
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === "TRUE_FALSE") {
        isCorrect = ans.answerText?.toLowerCase() === question.correctAnswer?.toLowerCase();
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === "SHORT_ANSWER") {
        isCorrect = ans.answerText?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
        pointsEarned = isCorrect ? question.points : 0;
      }
      // ESSAY: manual grading, isCorrect = null

      if (pointsEarned !== null) totalScore += pointsEarned;

      // Upsert answer
      return prisma.studentAnswer.upsert({
        where: {
          submissionId_questionId: {
            submissionId: validated.submissionId,
            questionId: ans.questionId,
          },
        },
        update: {
          answerText: ans.answerText,
          selectedOptionId: ans.selectedOptionId,
          isCorrect,
          pointsEarned,
          gradedAt: pointsEarned !== null ? new Date() : null,
        },
        create: {
          submissionId: validated.submissionId,
          questionId: ans.questionId,
          answerText: ans.answerText,
          selectedOptionId: ans.selectedOptionId,
          isCorrect,
          pointsEarned,
          gradedAt: pointsEarned !== null ? new Date() : null,
        },
      });
    })
  );

  // Update submission
  await prisma.examSubmission.update({
    where: { id: validated.submissionId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      totalScore,
    },
  });

  revalidatePath("/dashboard/student/exams");
  redirect("/dashboard/student/exams");
}