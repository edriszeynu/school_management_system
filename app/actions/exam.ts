"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

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
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const validated = examSchema.parse(data);
  await prisma.exam.create({ data: validated });
  revalidatePath("/dashboard/exams");
  redirect("/dashboard/exams");
}

export async function updateExam(id: string, data: z.infer<typeof examSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const validated = examSchema.parse(data);
  await prisma.exam.update({ where: { id }, data: validated });
  revalidatePath("/dashboard/exams");
  redirect("/dashboard/exams");
}

export async function deleteExam(id: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/dashboard/exams");
}