// app/dashboard/teacher/students/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/data-table";

export default async function TeacherStudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      classSubjects: { select: { classId: true } },
    },
  });

  if (!teacherProfile) redirect("/dashboard/teacher");

  const classIds = [
    ...new Set(
      teacherProfile.classSubjects
        .map((cs) => cs.classId)
        .filter((id): id is string => !!id)
    ),
  ];

  if (classIds.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">No classes assigned yet.</p>
        </div>
      </div>
    );
  }

  const students = await prisma.studentProfile.findMany({
    where: { classId: { in: classIds } },
    include: {
      user: { select: { name: true, email: true, isActive: true } },
      class: { select: { name: true } },
    },
    orderBy: { enrollmentDate: "desc" },
  });

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Students</h1>
        <p className="text-muted-foreground">
          All students across your classes — {students.length} total
        </p>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <DataTable data={tableData} detailsBasePath="/dashboard/students" />
      </div>
    </div>
  );
}
