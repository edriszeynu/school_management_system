// app/dashboard/fee-structures/new/page.tsx
import { prisma } from "@/lib/prisma";
import FeeStructureForm from "./FeeStructureForm";

export default async function NewFeeStructurePage() {
  const [academicYears, classes] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { name: "desc" } }),
    prisma.class.findMany({
      include: { academicYear: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <FeeStructureForm academicYears={academicYears} classes={classes} />
    </div>
  );
}