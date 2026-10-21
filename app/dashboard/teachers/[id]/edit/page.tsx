import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewTeacherForm from "../../new/NewTeacherForm";

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          gender: true,
        },
      },
    },
  });

  if (!teacher) notFound();

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <NewTeacherForm teacher={teacher} />
    </div>
  );
}
