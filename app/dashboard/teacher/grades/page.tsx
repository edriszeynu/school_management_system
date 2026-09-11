// @ts-nocheck
// app/dashboard/teacher/grades/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTeacherClassSubjects } from "@/app/actions/grade";
import GradeForm from "./GradeForm";

export default async function TeacherGradesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get teacher profile
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!teacherProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <h2 className="text-2xl font-bold">Teacher profile not found</h2>
        <p className="text-muted-foreground">
          Please contact the administrator.
        </p>
      </div>
    );
  }

  // Get teacher's class-subject options
  const classSubjects = await getTeacherClassSubjects(teacherProfile.id);

  // Build options for the dropdown
  const classSubjectOptions = classSubjects.map((cs) => ({
    id: cs.id,
    label: `${cs.class.name} - ${cs.class.section} (${cs.subject.name})`,
  }));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <GradeForm classSubjectOptions={classSubjectOptions} />
    </div>
  );
}
