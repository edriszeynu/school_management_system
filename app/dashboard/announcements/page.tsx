import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    include: {
      author: { select: { name: true } },
      class: { select: { name: true, section: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tableData = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content.substring(0, 60) + (a.content.length > 60 ? "..." : ""),
    targetRole: a.targetRole || "All",
    targetClass: a.class ? `${a.class.name} - ${a.class.section}` : "All",
    author: a.author.name,
    isImportant: a.isImportant ? "Yes" : "No",
    pinned: a.pinned ? "Yes" : "No",
    createdAt: a.createdAt.toISOString(),
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : "-",
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Post school‑wide announcements</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/announcements/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Announcement
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}