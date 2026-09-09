// app/(dashboard)/attendance/page.tsx
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export default async function AttendancePage() {
  // Fetch attendance records with student and class details
  const attendance = await prisma.attendance.findMany({
    include: {
      student: {
        include: {
          user: {
            select: { name: true },
          },
          class: {
            select: { name: true },
          },
        },
      },
      class: {
        select: { name: true },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Shape data for DataTable (auto-generates columns)
  const tableData = attendance.map((record) => ({
    id: record.id,
    studentName: record.student.user.name,
    className: record.class?.name || "N/A",
    date: record.date.toISOString(),
    status: record.status,
    remarks: record.remarks || "-",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">View all attendance records</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/attendance/mark">
            <PlusIcon className="mr-2 h-4 w-4" />
            Mark Attendance
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Total: <span className="font-medium">{attendance.length}</span> records
      </p>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}