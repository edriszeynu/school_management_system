// app/dashboard/announcements/new/page.tsx
import { prisma } from "@/lib/prisma";
import AnnouncementForm from "./AnnouncementForm";

export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  const classes = await prisma.class.findMany({
    select: { id: true, name: true, section: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <AnnouncementForm classes={classes} />
    </div>
  );
}