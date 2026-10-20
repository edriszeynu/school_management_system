// @ts-nocheck
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  classId: z.string().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  maxScore: z.coerce.number().positive("Max score must be positive"),
  weightage: z.coerce.number().min(0).max(100).optional(),
});

export async function createExam(data: z.infer<typeof examSchema>) {
  const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  const validated = examSchema.parse(data);
  const exam = await prisma.exam.create({ data: validated });
  revalidatePath("/dashboard/exams");
  revalidatePath("/dashboard/teacher");

  // Redirect teacher to their exam questions page, admin to exam list
  const s = await getServerSession(authOptions);
  if (s?.user?.role === "TEACHER") {
    redirect(`/dashboard/exams/${exam.id}/questions`);
  }
  redirect("/dashboard/exams");
}

export async function updateExam(id: string, data: z.infer<typeof examSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  const validated = examSchema.parse(data);
  await prisma.exam.update({ where: { id }, data: validated });
  revalidatePath("/dashboard/exams");

  const s = await getServerSession(authOptions);
  if (s?.user?.role === "TEACHER") {
    redirect(`/dashboard/exams/${id}/questions`);
  }
  redirect("/dashboard/exams");
}

export async function deleteExam(id: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/dashboard/exams");
}

export async function updateExamStatus(id: string, status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "CLOSED") {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.exam.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/exams");
}
