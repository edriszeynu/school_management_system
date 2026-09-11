"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  targetRole: z.enum(["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "TEACHER", "STUDENT", "PARENT"]).nullable(),
  targetClassId: z.string().nullable(),
  isImportant: z.boolean().default(false),
  pinned: z.boolean().default(false),
  expiresAt: z.date().nullable(),
});

export async function createAnnouncement(data: z.infer<typeof announcementSchema>) {
  const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

  const validated = announcementSchema.parse(data);
  await prisma.announcement.create({
    data: {
      ...validated,
      authorId: session.user.id,
    },
  });
  revalidatePath("/dashboard/announcements");
  redirect("/dashboard/announcements");
}

export async function updateAnnouncement(id: string, data: z.infer<typeof announcementSchema>) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  const validated = announcementSchema.parse(data);
  await prisma.announcement.update({ where: { id }, data: validated });
  revalidatePath("/dashboard/announcements");
  redirect("/dashboard/announcements");
}

export async function deleteAnnouncement(id: string) {
  await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/dashboard/announcements");
}