// app/(dashboard)/attendance/mark/page.tsx
import { prisma } from "@/lib/prisma";
import MarkAttendanceForm from "./MarkAttendanceForm";

export default async function MarkAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const { classId, date } = await searchParams;

  // Fetch all classes for dropdown
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      section: true,
      academicYear: {
        select: { name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Build class options
  const classOptions = classes.map((cls) => ({
    id: cls.id,
    label: `${cls.name} - ${cls.section} (${cls.academicYear.name})`,
  }));

  const selectedClassId = classId || undefined;
  const selectedDate = date ? new Date(date) : new Date();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <MarkAttendanceForm
        classOptions={classOptions}
        selectedClassId={selectedClassId}
        selectedDate={selectedDate}
      />
    </div>
  );
}