// app/actions/student.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema – matches the form
const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianContact: z.string().min(1, "Guardian contact is required"),
  guardianEmail: z.string().email("Invalid guardian email").optional(),
  address: z.string().optional(),
  medicalInfo: z.string().optional(),
  classId: z.string().min(1, "Please select a class"),
  rollNumber: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export async function createStudent(data: StudentFormValues) {
  // Validate
  const validated = studentSchema.parse(data);

  // 1. Create user
  const hashedPassword = await bcrypt.hash(validated.password, 10);
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      passwordHash: hashedPassword,
      name: validated.name,
      role: "STUDENT",
    },
  });

  // 2. Create student profile
  await prisma.studentProfile.create({
    data: {
      userId: user.id,
      dateOfBirth: validated.dateOfBirth,
      guardianName: validated.guardianName,
      guardianContact: validated.guardianContact,
      guardianEmail: validated.guardianEmail,
      address: validated.address,
      medicalInfo: validated.medicalInfo,
      classId: validated.classId,
      rollNumber: validated.rollNumber,
      enrollmentDate: new Date(),
    },
  });

  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}