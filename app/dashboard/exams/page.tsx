import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";

export default async function ExamsPage() {
  const exams = await prisma.exam.findMany({
    include: {
      academicYear: { select: { name: true } },
      class: { select: { name: true, section: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const tableData = exams.map((e) => ({
    id: e.id,
    name: e.title,
    email: e.academicYear.name,
    className: e.class ? `${e.class.name} - ${e.class.section}` : "School-wide",
    rollNumber: "-",
    status: "active" as const,
    enrolledAt: e.startDate.toISOString(),
    title: e.title,
    academicYear: e.academicYear.name,
    class: e.class ? `${e.class.name} - ${e.class.section}` : "School-wide",
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    maxScore: e.maxScore,
    weightage: e.weightage || "-",
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold">Exams</h1>
          <p className="text-muted-foreground">Manage all exams</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/exams/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <DataTable
          data={tableData}
          detailsBasePath="/dashboard/exams"
          detailsLabel="Open Questions"
        />
      </div>
    </div>
  );
}