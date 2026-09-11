// app/dashboard/teacher/attendance/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AttendanceForm from "./AttendanceForm";

export default async function TeacherAttendancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get teacher profile
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      classSubjects: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              section: true,
              academicYear: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!teacherProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Teacher profile not found.</p>
      </div>
    );
  }

  // Build class options
  const classOptions = teacherProfile.classSubjects.map((cs) => ({
    id: cs.class.id,
    label: `${cs.class.name} - ${cs.class.section} (${cs.class.academicYear?.name || "N/A"})`,
  }));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <AttendanceForm classOptions={classOptions} />
    </div>
  );
}