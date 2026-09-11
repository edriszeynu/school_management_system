// @ts-nocheck
// app/(dashboard)/students/page.tsx
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";

export default async function StudentsPage() {
  // Fetch students with user and class info
  const students = await prisma.studentProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          isActive: true,
        },
      },
      class: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      enrollmentDate: "desc",
    },
  });

  // Shape data for the DataTable
  const tableData = students.map((student) => ({
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    className: student.class?.name || "N/A",
    rollNumber: student.rollNumber || "-",
    status: (student.user.isActive ? "active" : "inactive") as "active" | "inactive",
    enrolledAt: student.enrollmentDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header with title and Add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage all students in the school
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/students/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>

      {/* Total count (optional) */}
      <p className="text-sm text-muted-foreground">
        Total: <span className="font-medium">{students.length}</span> students
      </p>

      {/* Table wrapped in a card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <DataTable data={tableData} detailsBasePath="/dashboard/students" />
      </div>
    </div>
  );
}
