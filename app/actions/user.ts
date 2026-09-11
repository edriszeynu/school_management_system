"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/authorization";

type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "ACCOUNTANT"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";
type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
};
type UpdateUserFormData = Omit<UserFormData, "password"> & { password?: string };

export async function updateUserRole(userId: string, role: UserRole) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/dashboard/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
  revalidatePath("/dashboard/users");
}

export async function deleteUser(userId: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/users");
}

// Add these to your existing user.ts

export async function createUser(data: UserFormData) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const { name, email, password, role, phone, gender } = data;
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role,
      phone,
      gender,
    },
  });

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function updateUser(id: string, data: UpdateUserFormData) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const { name, email, password, role, phone, gender } = data;

  const updateData: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    passwordHash?: string;
  } = { name, email, role, phone, gender };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}