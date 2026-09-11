"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

const feeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  classId: z.string().min(1, "Class is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  frequency: z.enum(["MONTHLY", "TERMLY", "ANNUAL"]),
  dueDay: z.coerce.number().min(1).max(31).optional(),
  isMandatory: z.boolean().default(true),
});

export async function createFeeStructure(data: z.infer<typeof feeSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const validated = feeSchema.parse(data);
  await prisma.feeStructure.create({ data: validated });
  revalidatePath("/dashboard/fee-structures");
  redirect("/dashboard/fee-structures");
}

export async function updateFeeStructure(id: string, data: z.infer<typeof feeSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const validated = feeSchema.parse(data);
  await prisma.feeStructure.update({ where: { id }, data: validated });
  revalidatePath("/dashboard/fee-structures");
  redirect("/dashboard/fee-structures");
}

export async function deleteFeeStructure(id: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.feeStructure.delete({ where: { id } });
  revalidatePath("/dashboard/fee-structures");
}