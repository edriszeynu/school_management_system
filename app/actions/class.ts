// app/actions/class.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schema
const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().int().positive("Capacity must be a positive number"),
});

export type ClassFormValues = z.infer<typeof classSchema>;

export async function createClass(data: ClassFormValues) {
  // Validate
  const validated = classSchema.parse(data);

  // Create class
  await prisma.class.create({
    data: {
      name: validated.name,
      section: validated.section,
      academicYearId: validated.academicYearId,
      roomNumber: validated.roomNumber,
      capacity: validated.capacity,
    },
  });

  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}