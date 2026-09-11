// app/actions/teacher.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

// Validation schema
const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  employeeId: z.string().optional(),
  hireDate: z.string().transform((str) => new Date(str)),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  isClassTeacher: z.boolean().default(false),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

export async function createTeacher(data: TeacherFormValues) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  // Validate
  const validated = teacherSchema.parse(data);

  // 1. Create user
  const hashedPassword = await bcrypt.hash(validated.password, 10);
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      passwordHash: hashedPassword,
      name: validated.name,
      role: "TEACHER",
      phone: validated.phone,
      gender: validated.gender,
    },
  });

  // 2. Create teacher profile
  await prisma.teacherProfile.create({
    data: {
      userId: user.id,
      employeeId: validated.employeeId,
      hireDate: validated.hireDate,
      qualification: validated.qualification,
      specialization: validated.specialization,
      isClassTeacher: validated.isClassTeacher,
    },
  });

  revalidatePath("/dashboard/teachers");
  redirect("/dashboard/teachers");
}