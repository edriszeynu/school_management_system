// app/(dashboard)/classes/page.tsx
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      academicYear: { select: { name: true } },
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  });

  const tableData = classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    section: cls.section,
    academicYear: cls.academicYear.name,
    roomNumber: cls.roomNumber || "-",
    capacity: cls.capacity,
    students: cls._count.students,
    createdAt: cls.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage all classes in the school</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/classes/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Class
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Total: <span className="font-medium">{classes.length}</span> classes
      </p>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}