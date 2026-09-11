// app/actions/question.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  examId: z.string(),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"]),
  questionText: z.string().min(1, "Question text is required"),
  points: z.coerce.number().positive(),
  correctAnswer: z.string().optional(),
  options: z.array(optionSchema).optional(),
});

export async function createQuestion(data: z.infer<typeof questionSchema>) {
  const validated = questionSchema.parse(data);

  // Get last order index
  const lastQuestion = await prisma.question.findFirst({
    where: { examId: validated.examId },
    orderBy: { orderIndex: "desc" },
  });
  const orderIndex = (lastQuestion?.orderIndex || 0) + 1;

  // For MCQ, find correct answer (text of correct option)
  let correctAnswer = validated.correctAnswer;
  if (validated.type === "MULTIPLE_CHOICE" && validated.options) {
    const correct = validated.options.find((o) => o.isCorrect);
    correctAnswer = correct?.text;
  }

  // Create question with options (if any)
  await prisma.question.create({
    data: {
      examId: validated.examId,
      type: validated.type,
      questionText: validated.questionText,
      points: validated.points,
      orderIndex,
      correctAnswer,
      options: validated.options
        ? {
            create: validated.options.map((opt, idx) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              orderIndex: idx,
            })),
          }
        : undefined,
    },
  });

  revalidatePath(`/dashboard/exams/${validated.examId}/questions`);
}

export async function deleteQuestion(questionId: string, examId: string) {
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/dashboard/exams/${examId}/questions`);
}

export async function publishExam(examId: string, status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "CLOSED") {
  await prisma.exam.update({
    where: { id: examId },
    data: { status },
  });
  revalidatePath(`/dashboard/exams/${examId}/questions`);
  revalidatePath("/dashboard/exams");
}