// app/(dashboard)/teachers/page.tsx
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DashboardBackButton } from "@/components/dashboard-back-button";

export default async function TeachersPage() {
  // Fetch teachers with user info and class assignments
  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
      classSubjects: {
        include: {
          class: {
            select: {
              name: true,
            },
          },
          subject: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      hireDate: "desc",
    },
  });

  // Shape data for the DataTable
  const tableData = teachers.map((teacher) => {
    // Get unique classes taught by this teacher
    const classes = teacher.classSubjects
      .map((cs) => cs.class.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", ");

    const subjects = teacher.classSubjects
      .map((cs) => cs.subject.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", ");

    return {
      id: teacher.id,
      name: teacher.user.name,
      email: teacher.user.email,
      phone: teacher.user.phone || "-",
      employeeId: teacher.employeeId || "-",
      qualification: teacher.qualification || "-",
      specialization: teacher.specialization || "-",
      classes: classes || "None",
      subjects: subjects || "None",
      status: teacher.user.isActive ? "active" : "inactive",
      hireDate: teacher.hireDate.toISOString(),
      isClassTeacher: teacher.isClassTeacher ? "Yes" : "No",
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with title and Add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBackButton />
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage all teachers in the school
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teachers/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Teacher
          </Link>
        </Button>
      </div>

      {/* Total count */}
      <p className="text-sm text-muted-foreground">
        Total: <span className="font-medium">{teachers.length}</span> teachers
      </p>

      {/* Table wrapped in a card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <DataTable data={tableData} detailsBasePath="/dashboard/teachers" />
      </div>
    </div>
  );
}