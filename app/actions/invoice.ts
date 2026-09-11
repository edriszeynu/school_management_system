// app/actions/invoice.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

// Validation schema
const invoiceSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  feeStructureId: z.string().min(1, "Please select a fee structure"),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.date({ required_error: "Due date is required" }),
  status: z.enum(["PAID", "PARTIAL", "UNPAID", "OVERDUE", "WAIVED"]),
  issueDate: z.date().optional(),
  lateFee: z.coerce.number().min(0, "Late fee cannot be negative").default(0),
  description: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export async function createInvoice(data: InvoiceFormValues) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]);
  // Validate
  const validated = invoiceSchema.parse(data);

  // Generate a unique invoice number (timestamp-based)
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const invoiceNumber = `INV-${timestamp}-${random}`;

  // Create invoice
  await prisma.invoice.create({
    data: {
      invoiceNumber,
      studentId: validated.studentId,
      feeStructureId: validated.feeStructureId,
      amount: validated.amount,
      dueDate: validated.dueDate,
      status: validated.status,
      issueDate: validated.issueDate || new Date(),
      lateFee: validated.lateFee,
      description: validated.description,
    },
  });

  revalidatePath("/dashboard/fees");
  redirect("/dashboard/fees");
}