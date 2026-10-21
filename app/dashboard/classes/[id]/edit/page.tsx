import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewClassForm from "../../new/NewClassForm";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [classRecord, academicYears] = await Promise.all([
    prisma.class.findUnique({ where: { id } }),
    prisma.academicYear.findMany({
      select: { id: true, name: true },
      orderBy: { name: "desc" },
    }),
  ]);

  if (!classRecord) notFound();

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <NewClassForm classRecord={classRecord} academicYears={academicYears} />
    </div>
  );
}
