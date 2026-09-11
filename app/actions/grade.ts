// app/actions/grade.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

// Get teacher's class-subject combinations
export async function getTeacherClassSubjects(teacherProfileId: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  return await prisma.classSubject.findMany({
    where: { teacherProfileId },
    include: {
      class: {
        select: { id: true, name: true, section: true },
      },
      subject: {
        select: { id: true, name: true },
      },
    },
    orderBy: { class: { name: "asc" } },
  });
}

// Get exams for a given class-subject
export async function getExamsForClassSubject(classSubjectId: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  const classSubject = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    select: { classId: true },
  });
  if (!classSubject) return [];

  return await prisma.exam.findMany({
    where: {
      classId: classSubject.classId,
    },
    select: {
      id: true,
      title: true,
      maxScore: true,
      startDate: true,
    },
    orderBy: { startDate: "desc" },
  });
}

// Get students for a class-subject with their existing grades for a given exam
export async function getStudentsWithGrades(
  classSubjectId: string,
  examId: string
) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  const classSubject = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    select: { classId: true },
  });
  if (!classSubject) return [];

  const students = await prisma.studentProfile.findMany({
    where: { classId: classSubject.classId },
    include: {
      user: { select: { name: true } },
      grades: {
        where: {
          classSubjectId,
          examId,
        },
        select: {
          id: true,
          score: true,
          remarks: true,
        },
      },
    },
    orderBy: { rollNumber: "asc" },
  });

  return students.map((s) => ({
    id: s.id,
    name: s.user.name,
    rollNumber: s.rollNumber || "-",
    gradeId: s.grades[0]?.id || null,
    score: s.grades[0]?.score ?? null,
    remarks: s.grades[0]?.remarks || "",
  }));
}

// Zod schema for saving grades
const gradeSchema = z.object({
  classSubjectId: z.string(),
  examId: z.string(),
  records: z.array(
    z.object({
      studentId: z.string(),
      score: z.coerce.number().nullable(),
      remarks: z.string().optional(),
      gradeId: z.string().nullable(),
    })
  ),
});

export async function saveGrades(data: z.infer<typeof gradeSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  const validated = gradeSchema.parse(data);

  // Use a transaction to update/create grades
  await prisma.$transaction(
    validated.records.map((record) => {
      return prisma.grade.upsert({
        where: {
          studentId_classSubjectId_examId: {
            studentId: record.studentId,
            classSubjectId: validated.classSubjectId,
            examId: validated.examId,
          },
        },
        update: {
          score: record.score || 0,
          remarks: record.remarks,
        },
        create: {
          studentId: record.studentId,
          classSubjectId: validated.classSubjectId,
          examId: validated.examId,
          score: record.score || 0,
          remarks: record.remarks,
        },
      });
    })
  );

  revalidatePath(`/dashboard/teacher/grades`);
  revalidatePath(`/dashboard/teacher`);
}

// ✅ NEW: Delete a grade by ID
export async function deleteGrade(gradeId: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);

  await prisma.grade.delete({
    where: { id: gradeId },
  });

  revalidatePath("/dashboard/teacher/grades");
  revalidatePath("/dashboard/teacher");
}