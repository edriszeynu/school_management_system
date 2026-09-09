// app/(dashboard)/classes/new/page.tsx
import { prisma } from "@/lib/prisma";
import NewClassForm from "./NewClassForm";

export default async function NewClassPage() {
  // Fetch all academic years for dropdown
  const academicYears = await prisma.academicYear.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "desc",
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <NewClassForm academicYears={academicYears} />
    </div>
  );
}