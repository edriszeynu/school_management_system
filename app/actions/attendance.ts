// app/actions/attendance.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

// Get students for a class with their current attendance for a given date
export async function getStudentsForAttendance(classId: string, date: Date) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  const students = await prisma.studentProfile.findMany({
    where: { classId },
    include: {
      user: {
        select: { name: true },
      },
      attendances: {
        where: {
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
          classId,
        },
        select: {
          status: true,
          id: true,
        },
      },
    },
    orderBy: {
      rollNumber: "asc",
    },
  });

  return students.map((student) => ({
    id: student.id,
    name: student.user.name,
    rollNumber: student.rollNumber || "-",
    attendanceId: student.attendances[0]?.id || null,
    status: student.attendances[0]?.status || null,
  }));
}

// Save attendance (create or update)
const attendanceSchema = z.object({
  classId: z.string(),
  date: z.date(),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      attendanceId: z.string().nullable(),
    })
  ),
});

export async function saveAttendance(data: z.infer<typeof attendanceSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
  const validated = attendanceSchema.parse(data);

  // Use a transaction to handle multiple updates/creates
  await prisma.$transaction(
    validated.records.map((record) => {
      if (record.attendanceId) {
        // Update existing attendance
        return prisma.attendance.update({
          where: { id: record.attendanceId },
          data: { status: record.status },
        });
      } else {
        // Create new attendance
        return prisma.attendance.create({
          data: {
            studentId: record.studentId,
            classId: validated.classId,
            date: validated.date,
            status: record.status,
          },
        });
      }
    })
  );

  revalidatePath(`/dashboard/attendance`);
  redirect("/dashboard/attendance");
}