// app/actions/settings.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

// Update user profile
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
});

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const validated = profileSchema.parse(data);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: validated.name,
      phone: validated.phone,
    },
  });

  revalidatePath("/dashboard/settings");
}

// Change password
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function changePassword(data: z.infer<typeof passwordSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const validated = passwordSchema.parse(data);

  // Get user with password hash
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) throw new Error("User not found");

  // Verify current password
  const isValid = await bcrypt.compare(validated.currentPassword, user.passwordHash);
  if (!isValid) throw new Error("Current password is incorrect");

  // Hash new password
  const hashed = await bcrypt.hash(validated.newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashed },
  });

  revalidatePath("/dashboard/settings");
}

// Academic Year management
const academicYearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export async function createAcademicYear(data: z.infer<typeof academicYearSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const validated = academicYearSchema.parse(data);

  await prisma.academicYear.create({
    data: {
      name: validated.name,
      startDate: validated.startDate,
      endDate: validated.endDate,
      isCurrent: false,
    },
  });

  revalidatePath("/dashboard/settings");
}

export async function setCurrentAcademicYear(id: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  // First, unset all current years
  await prisma.academicYear.updateMany({
    where: { isCurrent: true },
    data: { isCurrent: false },
  });

  // Set the selected year as current
  await prisma.academicYear.update({
    where: { id },
    data: { isCurrent: true },
  });

  revalidatePath("/dashboard/settings");
}

export async function deleteAcademicYear(id: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  // Optional: check if any classes are linked to this year
  const hasClasses = await prisma.class.findFirst({
    where: { academicYearId: id },
  });

  if (hasClasses) {
    throw new Error("Cannot delete academic year that has classes assigned.");
  }

  await prisma.academicYear.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings");
}